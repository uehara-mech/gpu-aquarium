import argparse
import dataclasses
import glob
import json
import logging
import os
import time
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Union

import filelock
from filelock import SoftFileLock
from rich.console import Console
from rich.logging import RichHandler

from importlib import reload
import modules.node_info_collector
from modules.node_info_collector import NodeInfoCollector, NodeInfoContainer

class ServerLogger:
    def __init__(
            self,
            log_interval: int,
            save_interval: int,
            max_size_mb: float,
            max_files: int,
            keep_days: int,
            keep_hours: int,
            keep_minutes: int,
            keep_seconds: int,
            is_debug=False,
            long_term_interval_min=5.0  # minutes
    ):
        """
        Base class for logging server information
        Args:
            log_interval: (int) interval to collect server info (seconds)
            save_interval: (int) interval to save log (seconds)
            max_size_mb: (float) maximum size of log files to keep (MB)
            max_files: (int) maximum number of log files to keep
            keep_days: (int) days to keep the log files
            keep_hours: (int) hours to keep the log files
            keep_minutes: (int) minutes to keep the log files
            keep_seconds: (int) seconds to keep the log files
            is_debug: (bool) flag to show debug logs
            long_term_interval_min: (float) interval to save long term log (minutes)
        """
        self.node_info_collector = NodeInfoCollector()

        self.host_name = os.uname()[1]

        self.is_debug = is_debug

        self.log_interval = log_interval
        self.save_interval = save_interval

        self.max_size_mb = max_size_mb
        self.max_files = max_files
        self.keep_seconds = keep_days * 24 * 60 * 60 + keep_hours * 60 * 60 + keep_minutes * 60 + keep_seconds

        # setup root save directory
        self.save_dir = f"data/{self.host_name}"
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
            log.info(f"created {self.save_dir} directory")

        # setup log directory
        self.log_save_dir = f"{self.save_dir}/log"
        if not os.path.exists(self.log_save_dir):
            os.makedirs(self.log_save_dir)
            log.info(f"created {self.log_save_dir} directory")

        # config about long term log
        self.long_term_log_file = f"{self.save_dir}/long_term_log.json"
        self.long_term_interval_min = long_term_interval_min

        # get the latest log file's creation time (unix time)
        self.last_save_utime = -1
        log_files = glob.glob(f"{self.log_save_dir}/*.json")
        if len(log_files) > 0:
            latest_log_file = max(log_files, key=os.path.getctime)
            self.last_save_utime = os.path.getctime(latest_log_file)
            last_save_time_jst = datetime.fromtimestamp(self.last_save_utime).strftime('%Y-%m-%d %H:%M:%S')
            log.debug(f"last save time: {last_save_time_jst}")

        self.module_timestamps = {
            "NodeInfoCollector": os.path.getmtime(modules.node_info_collector.__file__),
            "NodeInfoContainer": os.path.getmtime(modules.node_info_collector.__file__)
        }

    def reload_modules(self):
        """
        Reload the NodeInfoCollector and NodeInfoContainer modules dynamically.
        If modules are reloaded, log a message indicating the update.
        """
        global NodeInfoCollector, NodeInfoContainer
        collector_mtime = os.path.getmtime(modules.node_info_collector.__file__)
        if collector_mtime != self.module_timestamps["NodeInfoCollector"]:
            reload(modules.node_info_collector)
            NodeInfoCollector = modules.node_info_collector.NodeInfoCollector
            NodeInfoContainer = modules.node_info_collector.NodeInfoContainer
            self.node_info_collector = NodeInfoCollector()
            self.module_timestamps["NodeInfoCollector"] = collector_mtime
            log.info("Modules NodeInfoCollector and NodeInfoContainer have been updated and reloaded.")

    def save_server_log(self, server_log: NodeInfoContainer):
        """
        save both latest and long term logs
        """
        self.save_latest_log(server_log)
        self.save_long_term_log(server_log)

    def save_long_term_log(self, server_log: NodeInfoContainer) -> None:
        """
        save long term log; save only once in `self.long_term_interval_min` minutes
        (default: 5 minutes)
        """
        if os.path.exists(self.long_term_log_file):
            # get last updated time of long term log
            long_term_last_save_time = os.path.getmtime(self.long_term_log_file)
            elapsed_from_last_save = time.time() - long_term_last_save_time
            if elapsed_from_last_save < self.long_term_interval_min * 60:
                # time interval is not reached yet; skip saving
                return
            # load old long term log
            with open(self.long_term_log_file, 'r') as fr:
                long_term_log: Dict[str, List[Union[str, float]]] = json.load(fr)
        else:
            # create new long term log
            long_term_log = {}

        # extract necessary information
        gpu_memories: List[float] = []
        gpu_utils: List[float] = []
        for g in server_log.gpu_info:
            try:
                each_gpu_memory = int(g.memory_used.split()[0]) / int(g.memory_total.split()[0])
                each_gpu_util = float(g.gpu_util.split()[0])
            except Exception as e:
                each_gpu_memory = 0.0
                each_gpu_util = 0.0
            gpu_memories.append(each_gpu_memory)
            gpu_utils.append(each_gpu_util)

        file_server_info = {
            each_file_info.target_host: each_file_info.ping_result
            for each_file_info in server_log.file_server_info
        }

        each_log = {
            "node_cpu_memory": server_log.basic_info.node_cpu_memory,  # float
            "node_cpu_usage": server_log.basic_info.node_cpu_usage,  # float
            "timestamp": time.time()
        }
        for i, each_gpu_memory in enumerate(gpu_memories):
            each_log[f"gpu{i}_memory"] = each_gpu_memory  # float
            each_log[f"gpu{i}_util"] = gpu_utils[i]  # float
        for each_file_server, each_ping_result in file_server_info.items():
            each_log[each_file_server] = each_ping_result

        # add to long term log
        keys = set(list(long_term_log.keys()) + list(each_log.keys()))
        length = max(len(long_term_log.get(k, [])) for k in keys)

        # remove old logs to keep the latest `self.keep_seconds` seconds
        cutoff_time = time.time() - self.keep_seconds
        if 'timestamp' in long_term_log:
            cutoff_candidates = [i for i, x in enumerate(long_term_log['timestamp']) if x > cutoff_time]
            if len(cutoff_candidates) > 0:
                cutoff_index = min(cutoff_candidates)
            else:
                cutoff_index = 0
        else:
            cutoff_index = 0
        for k in keys:
            long_term_log[k] = long_term_log.get(k, [0.0] * length) + [each_log.get(k, None)]
            long_term_log[k] = long_term_log[k][cutoff_index:]

        with open(self.long_term_log_file, 'w') as fw:
            json.dump(long_term_log, fw)
        log.info(f'updated long term log to {len(long_term_log["timestamp"])}')

    def save_latest_log(self, server_log: NodeInfoContainer):
        """
        save the latest log to a file;
        1. save the latest log to a file (e.g., latest_log.json)
           this file is saved every `self.log_interval` seconds
        2. save the log to keep to the log directory (e.g., log/log_2021-0123-123456.json)
           this file is saved every `self.save_interval` seconds
        """
        # save the latest log to a file
        server_log_dict = dataclasses.asdict(server_log)
        latest_log_path = f"{self.save_dir}/latest_log.json"
        lock = SoftFileLock(f"{latest_log_path}.lock", timeout=3)
        with lock:
            with open(f"{latest_log_path}", 'w') as fw:
                json.dump(server_log_dict, fw)
        log_message = f"saved latest log to {latest_log_path}"

        # save the log to the log directory
        if time.time() - self.last_save_utime > self.save_interval:
            log.debug(f"save_interval reached: {time.time() - self.last_save_utime} > {self.save_interval}")
            timestamp = datetime.now().strftime("%Y-%m%d-%H%M%S")
            # convert timestamp to JST
            timestamp = datetime.now(timezone(timedelta(hours=9))).strftime("%Y-%m%d-%H%M%S")
            # add gpu util info to the log file name in the format of "log_2021-0123-123456_GFUAUF....json"
            # F: free, U: used, A: available
            # free: gpu_util < 10% and memory < 10%
            # used: gpu_util > 90% or memory > 90%
            # available: otherwise
            gpu_utils = []
            for g in server_log.gpu_info:
                try:
                    # g.gpu_util: e.g., "0 %"
                    each_gpu_util = float(g.gpu_util.split()[0])
                    # memory_free='47086 MiB', memory_total='81559 MiB', memory_used='33921 MiB'
                    each_memory_total = int(g.memory_total.split()[0])
                    each_memory_used = int(g.memory_used.split()[0])
                    each_memory_usage = (each_memory_used / each_memory_total) * 100
                    if each_gpu_util < 10 and each_memory_usage < 10:
                        each_gpu_util = "F"
                    elif each_gpu_util > 90 or each_memory_usage > 90:
                        each_gpu_util = "U"
                    else:
                        each_gpu_util = "A"
                except Exception as e:
                    each_gpu_util = "N"
                gpu_utils.append(each_gpu_util)
            gpu_util_str = f"G{''.join([x for x in gpu_utils])}"
            log_file_path = os.path.join(self.log_save_dir, f"log_{timestamp}_{gpu_util_str}.json")
            with open(log_file_path, 'w') as fw:
                json.dump(server_log_dict, fw)
            log_message += f" and {log_file_path}"
            # update last save time
            self.last_save_utime = time.time()

        log.debug(f'{log_message}')

    def delete_old_logs(self) -> List[str]:
        """
        delete old log files; removing strategy is as follows:
        1. remove log files if the total size exceeds `self.max_size_mb` MB
        2. remove log files if the number of log files exceeds `self.max_files`
        3. remove log files if the creation time is older than `self.keep_seconds` seconds
        Returns:
            List[str]: list of removed log file paths
        """
        total_size = 0
        file_list = []
        removed_file_list = []
        now = time.time()
        cutoff_time = now - self.keep_seconds

        for file in os.listdir(self.log_save_dir):
            file_path = os.path.join(self.log_save_dir, file)
            # check if the filename starts with "log_"
            if not file.startswith("log_"):
                continue
            if os.path.isfile(file_path):
                file_size = os.path.getsize(file_path)
                file_ctime = os.path.getctime(file_path)
                total_size += file_size
                file_list.append((file_path, file_size, file_ctime))

        total_size_mb = total_size / (1024 * 1024)

        is_size_over = total_size_mb > self.max_size_mb
        is_ctime_over = any(file_ctime < cutoff_time for _, _, file_ctime in file_list)
        is_file_num_over = len(file_list) > self.max_files
        if is_size_over or is_ctime_over or is_file_num_over:
            # Sort by creation time (oldest first)
            sorted_file_list = sorted(file_list, key=lambda x: x[2])
            # keep the latest file (i.e. the last file in the list)
            sorted_file_list = sorted_file_list[:-1]

            while (is_size_over := total_size_mb > self.max_size_mb) \
                    or (is_ctime_over := any(file_ctime < cutoff_time for _, _, file_ctime in sorted_file_list)) \
                    or (is_file_num_over := len(sorted_file_list) > self.max_files):
                log.debug(f"limit exceeded: size={is_size_over}, ctime={is_ctime_over}, num={is_file_num_over}")
                file_to_remove, file_size, file_ctime = sorted_file_list.pop(0)

                # Delete!
                os.remove(file_to_remove)
                removed_file_list.append(file_to_remove)
                log.debug(f"removed {file_to_remove}")

                total_size_mb -= file_size / (1024 * 1024)
        return removed_file_list

    def log(self) -> Dict[str, Union[str, List[str]]]:
        self.reload_modules()
        node_info: NodeInfoContainer = self.node_info_collector.collect()

        self.save_server_log(node_info)

        removed_files = self.delete_old_logs()

        time.sleep(self.log_interval)

        log.debug(f"removed files: {removed_files}")

        return {
            "removed_files": removed_files
        }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('--debug', '-d', action='store_true')
    parser.add_argument(
        '--log_interval', type=int, default=5,
        help='interval to collect server info (default: 5 seconds)'
    )
    parser.add_argument(
        '--save_interval', type=int, default=3600,
        help='interval to save log (default: 3600 seconds)'
    )
    parser.add_argument(
        '--max_size_mb', type=float, default=50,
        help='maximum size of log files to keep (default: 50)'
    )
    parser.add_argument(
        '--max_files', type=int, default=72,
        help='maximum number of log files to keep (default: 72)'
    )
    parser.add_argument(
        '--keep_days', type=int, default=3,
        help='days to keep the log files (default: 3)'
    )
    parser.add_argument(
        '--keep_hours', type=int, default=0,
        help='hours to keep the log files (default: 0)'
    )
    parser.add_argument(
        '--keep_minutes', type=int, default=0,
        help='minutes to keep the log files (default: 0)'
    )
    parser.add_argument(
        '--keep_seconds', type=int, default=0,
        help='seconds to keep the log files (default: 0 seconds)'
    )
    args = parser.parse_args()

    if args.debug:
        # set log level to debug
        log_level = logging.DEBUG
    else:
        # set log level to info
        log_level = logging.INFO

    logging.basicConfig(
        format=' %(message)s',
        level=log_level,
        handlers=[RichHandler(rich_tracebacks=True, tracebacks_suppress=[filelock])]
    )
    log = logging.getLogger('rich')
    console = Console()

    # show configs
    params = vars(args)
    log.info('config:')
    for key, value in params.items():
        log.info(f'  {key}: {value}')

    host_name = os.uname()[1]

    server_logger = ServerLogger(
        log_interval=args.log_interval,
        save_interval=args.save_interval,
        max_size_mb=args.max_size_mb,
        max_files=args.max_files,
        keep_days=args.keep_days,
        keep_hours=args.keep_hours,
        keep_minutes=args.keep_minutes,
        keep_seconds=args.keep_seconds,
        is_debug=True,
    )

    # if args.debug:
    #     _ = server_logger.log()
    # else:
    while True:
        _ = server_logger.log()
        # console.print(f"saved to {log_file_paths['log_file_path']}")
        # console.print(f"removed {log_file_paths['removed_files']}")
