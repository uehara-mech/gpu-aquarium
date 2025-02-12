import argparse
import glob
import json
import logging
import os
from typing import List

import yaml
from rich.logging import RichHandler
import time
from datetime import datetime, timezone, timedelta

from utils import check_time_status

logging.basicConfig(
    format=' %(message)s',
    level=logging.INFO,
    handlers=[RichHandler(rich_tracebacks=True)]
)
log = logging.getLogger('rich')


def main():
    while True:
        # load config
        with open("config.yaml", 'r') as f:
            config = yaml.safe_load(f)

        merged_data = {}
        data_dirs = glob.glob(f"{data_dir}/*")
        for each_data_dir in data_dirs:
            try:
                log_files = glob.glob(f"{each_data_dir}/log*.json")
                if len(log_files) == 0:
                    latest_log = f"{each_data_dir}/latest_log.json"
                else:
                    latest_log = max(log_files, key=os.path.getctime)
                log.info(f"reading {latest_log} ...")

                with open(latest_log, mode='r') as f:
                    data = f.read()
                    file_data = json.loads(data)

                    each_host = file_data.get('basic_info', {}).get('host_name', 'unknown')

                    basic_gpu_name = config['server'].get(each_host, {}).get('gpu', 'unknown')
                    if basic_gpu_name == 'unknown':
                        original_gpu_info = file_data.get('gpu_info', [])
                        if len(original_gpu_info) > 0:
                            basic_gpu_name = original_gpu_info[0].get('gpu_name', 'N/A')
                    file_data['basic_info']['gpu_name'] = basic_gpu_name
                    log.info(f"basic_info['gpu_name'] = {basic_gpu_name}")

                    process_users: List[str] = [process_info['user'] for process_info in file_data.get('process_info', []) if 'user' in process_info]
                    file_data['users'] = list(set(process_users))
                    if 'process_info' in file_data:
                        del file_data['process_info']

                    # add status info
                    # if gpu_info is empty, then the status is 'error'
                    # if basic_info.time (e.g., "2024/07/25 13:34:31") is older than 30 minutes, then the status is 'warning'
                    # otherwise, the status is 'operational'
                    status = 'operational'
                    if len(file_data.get('gpu_info', [])) == 0:
                        status = 'error'
                    else:
                        time_str = file_data.get('basic_info', {}).get('time', '')
                        status = check_time_status(time_str, status)
                    file_data['basic_info']['status'] = status

                    # add visibility info
                    if config['server'].get(each_host, {}).get('status') == "hidden":
                        file_data['basic_info']['visibility'] = "hidden"
                    else:
                        file_data['basic_info']['visibility'] = "visible"

                    merged_data[each_host] = file_data
            except Exception as e:
                log.error(f"Error merging JSON files: {e}")

        log.info(f"writing merged_data.json ...")
        with open("merged_data.json", mode='w') as f:
            f.write(json.dumps(merged_data, ensure_ascii=False, indent=2))
        log.info(f"done writing merged_data.json !\n")

        time.sleep(5)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('--data-dir', default='data', help='')
    args = parser.parse_args()

    data_dir = args.data_dir
    main()
