import glob
import inspect
import logging
import os
import platform
import re
import subprocess
import warnings
from collections import OrderedDict
from datetime import datetime, timezone, timedelta
from time import sleep
from typing import Union, List, Any, NamedTuple, Dict, Tuple, Set

import psutil
import xmltodict

logging.basicConfig(format='[%(asctime)s] [%(levelname)s] [%(real_funcName)s line: %(real_lineno)s] - %(message)s')


memory_re_pattern = re.compile(r'(\d+)')


class GpuProcessContainer(NamedTuple):
    cpu: str = 'N/A'
    cpu_memory: str = 'N/A'
    pid: str = 'N/A'
    process_name: str = 'N/A'
    start: str = 'N/A'
    top_name: str = 'N/A'
    used_memory: str = 'N/A'
    user: str = 'N/A'


class CpuProcessContainer(NamedTuple):
    cpu: str = 'N/A'
    memory: str = 'N/A'
    name: List[str] = []
    pid: int = 'N/A'
    start: str = 'N/A'
    status: str = 'N/A'
    user: str = 'N/A'


class GpuInfoContainer(NamedTuple):
    fan_speed: str = 'N/A'
    gpu_id: str = 'N/A'
    gpu_name: str = 'N/A'
    gpu_power_draw: str = 'N/A'
    gpu_power_limit: str = 'N/A'
    gpu_temperature: str = 'N/A'
    gpu_util: str = 'N/A'
    memory_free: str = 'N/A'
    memory_total: str = 'N/A'
    memory_used: str = 'N/A'
    processes: List[Dict[str, Any]] = []


class OsInfoContainer(NamedTuple):
    available_cuda: List[str] = []
    default_cuda: str = 'N/A'
    os: str = 'N/A'
    uname: str = 'N/A'


class ServerInfoContainer(NamedTuple):
    os: OrderedDict = OsInfoContainer()._asdict()
    driver_ver: str = 'N/A'
    cpu_usage: Dict[str, str] = {'cpu': 'N/A', 'mem': 'N/A'}
    gpu: List[OrderedDict] = []
    gpu_memory: str = 'N/A'
    gpu_users: List[str] = []
    host_name: str = 'N/A'
    status: str = 'N/A'
    time: str = 'N/A'
    top: List[OrderedDict] = []


def exception_handler(default_key: str):
    def _exception_handler(func):
        def wrapper(self, *args, **kwargs):
            extra = {
                'real_filename': inspect.getfile(func),
                'real_funcName': func.__name__,
                'real_lineno': inspect.currentframe().f_back.f_lineno
            }
            try:
                result = func(self, *args, **kwargs)
                return result
            except Exception as e:
                print('')
                logging.warning("{}".format(str(e)), extra=extra)
                return self.default_value._asdict()[default_key]
        return wrapper
    return _exception_handler


def get_save_path(current_dir, host_name):
    current_time = datetime.now(
        timezone(timedelta(hours=9))
    ).strftime("%Y-%m-%d-%H-%M-%S")
    return os.path.join(current_dir, 'data', host_name, f'{host_name}_{current_time}.json')


class CollectOsInfo:
    def __init__(self):
        self.default_value: OsInfoContainer = OsInfoContainer()

    def collect_os_info(self):
        return OsInfoContainer(
            available_cuda=self.get_available_cuda(),
            default_cuda=self.get_default_cuda(),
            os=self.get_os(),
            uname=self.get_uname()
        )

    @exception_handler('available_cuda')
    def get_available_cuda(self) -> List[str]:
        # get avalilable cuda list for OsInfoContainer
        cuda_dir_list = glob.glob('/usr/local/cuda-*')
        available_cuda = sorted([x.split('-')[-1] for x in cuda_dir_list], key=lambda x: float(x))
        return available_cuda

    @exception_handler('default_cuda')
    def get_default_cuda(self) -> str:
        # get default cuda (symlink of /usr/local/cuda) for OsInfoContainer
        default_cuda = os.readlink('/usr/local/cuda').split('-')[-1].strip('/')
        return default_cuda

    @exception_handler('os')
    def get_os(self) -> str:
        # get os version like '14.04.5 LTS, Trusty Tahr' for OsInfoContainer
        with open("/etc/os-release") as f:
            os_release = {}
            for line in f:
                k, v = line.rstrip().split("=")
                os_release[k] = v.strip('"')
        return os_release['VERSION']

    @exception_handler('uname')
    def get_uname(self) -> str:
        # platform version like '3.13.0-143-generic' for OsInfoContainer
        uname = platform.release()
        return uname


class CollectServerInfo:
    def __init__(self):
        self.default_value = ServerInfoContainer()

    def collect_server_info(self):
        # os, gpu, cpu, top_processの情報を集め，最後に欠けている項目の補完を行う
        os_info: OsInfoContainer = self.collect_os_info()
        all_process_info, filtered_process_info = self.collect_process_info()

        nvidia_smi_out = self.exec_nvidia_smi()
        parsed_nvidia_smi = self.parse_nvidia_smi(nvidia_smi_out)

        gpu_infos = self.collect_all_gpu_info(parsed_nvidia_smi, all_process_info)

        return ServerInfoContainer(
            os=os_info._asdict(),
            driver_ver=self.get_driver_ver(parsed_nvidia_smi),
            cpu_usage=self.get_cpu_usage(),
            gpu=[x._asdict() for x in gpu_infos],
            gpu_memory=self.get_gpu_memory(gpu_infos),
            gpu_users=self.get_gpu_user(gpu_infos),
            host_name=self.get_host_name(),
            status='N/A',
            time=self.get_time(),
            top=[x._asdict() for x in filtered_process_info]
        )

    @exception_handler('gpu_users')
    def get_gpu_user(self, gpu_infos: List[GpuInfoContainer]):
        gpu_users = []
        for each_gpu in gpu_infos:
            gpu_users.extend([x['user'] for x in each_gpu.processes])
        gpu_users = list(set(gpu_users))
        return gpu_users

    @exception_handler('gpu_memory')
    def get_gpu_memory(self, gpu_infos: List[GpuInfoContainer]):
        total_gpu_memory = gpu_infos[0].memory_total
        if total_gpu_memory != ServerInfoContainer.gpu_memory:
            total_gpu_memory = int(memory_re_pattern.search(total_gpu_memory).group(1))
            max_gpu_memory = "{}GB".format(int(total_gpu_memory / 1000))
        return max_gpu_memory

    @exception_handler('time')
    def get_time(self):
        return datetime.now(
            timezone(timedelta(hours=9))
        ).strftime("%Y/%m/%d %H:%M:%S")

    @exception_handler('host_name')
    def get_host_name(self):
        return os.uname()[1]

    @exception_handler('driver_ver')
    def get_driver_ver(self, parsed_nvidia_smi: OrderedDict):
        return parsed_nvidia_smi.get('driver_version', '')

    @exception_handler('cpu_usage')
    def get_cpu_usage(self) -> Dict[str, str]:
        cpu_percent = psutil.cpu_percent()
        memory_percent = psutil.virtual_memory().percent
        return {'cpu': cpu_percent, 'mem': memory_percent}

    @exception_handler('os')
    def collect_os_info(self):
        os_info_collector = CollectOsInfo()
        return os_info_collector.collect_os_info()

    @staticmethod
    def collect_process_info() -> Tuple[List[CpuProcessContainer], List[CpuProcessContainer]]:
        process_info_collector = CollectProcessInfo()
        all_process_info, filtered_process_info = process_info_collector.collect_process_info()
        return all_process_info, filtered_process_info

    @staticmethod
    def exec_nvidia_smi():
        try:
            out_nvidia_smi = subprocess.run(['nvidia-smi', '-q', '-x'], stdout=subprocess.PIPE, timeout=30)
            out_nvidia_smi = out_nvidia_smi.stdout.decode()
            return out_nvidia_smi
        except Exception as e:
            warnings.warn(str(e))
            return None

    @staticmethod
    def parse_nvidia_smi(out_nvidia_smi):
        nvidia_smi_log = OrderedDict()
        try:
            parsed_nvidia_smi: OrderedDict = xmltodict.parse(out_nvidia_smi)
            nvidia_smi_log = parsed_nvidia_smi.get('nvidia_smi_log', OrderedDict())
        except Exception as e:
            warnings.warn(str(e))
        return nvidia_smi_log

    @exception_handler('gpu')
    def collect_all_gpu_info(
            self,
            parsed_nvidia_smi: OrderedDict,
            all_process_info: List[CpuProcessContainer]
    ) -> List[GpuInfoContainer]:
        # run nvidia-smi and collect gpu information
        gpu_infos = []
        if 'gpu' in parsed_nvidia_smi:
            num_gpu = len(parsed_nvidia_smi['gpu'])
            for each_gpu_index in range(num_gpu):
                each_parsed_nv = parsed_nvidia_smi['gpu'][each_gpu_index]
                gpu_info_collector = CollectGpuInfo(each_gpu_index, each_parsed_nv)
                gpu_infos.append(gpu_info_collector.collect_gpu_info(all_process_info))
        return gpu_infos


class CollectGpuInfo:  # TODO: exception_handlerを用いた書き直し
    """
    class for collect EACH gpu information
    """
    def __init__(self, gpu_idx: int, nvidia_smi_gpu: OrderedDict):
        """

        :param gpu_idx: int
        :param nvidia_smi_gpu: each gpu information (value of parsed nvidia-smi of certain gpu idx)
        """
        self.nvidia_smi_gpu = nvidia_smi_gpu
        self.gpu_idx = gpu_idx
        self.default_value = GpuInfoContainer()

    def collect_gpu_info(self, all_cpu_process: List[CpuProcessContainer]) -> GpuInfoContainer:
        if len(self.nvidia_smi_gpu) == 0:
            return GpuInfoContainer()
        return GpuInfoContainer(
            fan_speed=self.get_fan_speed(),
            gpu_id=str(self.gpu_idx),
            gpu_name=self.get_gpu_name(),
            gpu_power_draw=self.get_gpu_power_draw(),
            gpu_power_limit=self.get_gpu_power_limit(),
            gpu_temperature=self.get_gpu_temperature(),
            gpu_util=self.get_gpu_util(),
            memory_free=self.get_memory_free(),
            memory_total=self.get_memory_total(),
            memory_used=self.get_memory_used(),
            processes=self.get_gpu_processes(all_cpu_process),
        )

    @exception_handler('fan_speed')
    def get_fan_speed(self) -> str:
        return self.nvidia_smi_gpu['fan_speed']

    @exception_handler('gpu_name')
    def get_gpu_name(self) -> str:
        return self.nvidia_smi_gpu['product_name']

    @exception_handler('gpu_power_draw')
    def get_gpu_power_draw(self) -> str:
        gpu_power_readings = self.nvidia_smi_gpu['power_readings']
        gpu_power_draw = gpu_power_readings['power_draw']
        return gpu_power_draw

    @exception_handler('gpu_power_limit')
    def get_gpu_power_limit(self) -> str:
        gpu_power_readings = self.nvidia_smi_gpu['power_readings']
        gpu_power_limit = gpu_power_readings['power_limit']
        return gpu_power_limit

    @exception_handler('gpu_temperature')
    def get_gpu_temperature(self) -> str:
        gpu_temperature = self.nvidia_smi_gpu['temperature']['gpu_temp']
        return gpu_temperature

    @exception_handler('gpu_util')
    def get_gpu_util(self) -> str:
        gpu_utilization = self.nvidia_smi_gpu['utilization']['gpu_util']
        return gpu_utilization

    @exception_handler('memory_free')
    def get_memory_free(self) -> str:
        memory_usage_free = self.nvidia_smi_gpu['fb_memory_usage']['free']
        return memory_usage_free

    @exception_handler('memory_total')
    def get_memory_total(self) -> str:
        memory_usage_total = self.nvidia_smi_gpu['fb_memory_usage']['total']
        return memory_usage_total

    @exception_handler('memory_used')
    def get_memory_used(self) -> str:
        fb_memory_usage = self.nvidia_smi_gpu['fb_memory_usage']['used']
        return fb_memory_usage

    @exception_handler('processes')
    def get_gpu_processes(self, all_cpu_processes: List[CpuProcessContainer]) -> List[Dict[str, Any]]:
        all_gpu_processes: List[Dict[str, Any]] = []
        cpu_process_dic: Dict[int, CpuProcessContainer] = {
            x.pid: x for x in all_cpu_processes
        }
        processes = self.nvidia_smi_gpu.get('processes', {})
        if processes is None:
            return []
        process_info: Union[List[OrderedDict], OrderedDict] = processes.get('process_info', [])
        if type(process_info) is not list:
            process_info = [process_info]

        for each_process_info in process_info:
            each_gpu_pid = each_process_info.get('pid', '')

            # 該当するCPU processがない場合はデフォルト値
            correspond_cpu_process = CpuProcessContainer()
            if each_gpu_pid != '':
                if int(each_gpu_pid) in cpu_process_dic:
                    correspond_cpu_process = cpu_process_dic[int(each_gpu_pid)]

            each_process_container = GpuProcessContainer(
                cpu=correspond_cpu_process.cpu,
                cpu_memory=correspond_cpu_process.memory,
                pid=each_gpu_pid,
                process_name=each_process_info.get('process_name', ''),
                start=correspond_cpu_process.start,
                top_name=' '.join(correspond_cpu_process.name),
                used_memory=each_process_info.get('used_memory'),
                user=correspond_cpu_process.user
            )
            all_gpu_processes.append(dict(each_process_container._asdict()))
        return all_gpu_processes


class CollectProcessInfo:
    def __init__(self):
        self.default_value = CpuProcessContainer()
        self.process_list: List[CpuProcessContainer] = []
        self.filtered_process_list: List[CpuProcessContainer] = []

    def collect_process_info(self) -> Tuple[List[CpuProcessContainer], List[CpuProcessContainer]]:
        self.process_list = self.get_process_info()
        self.filtered_process_list = self.get_filtered_process_info()
        return self.process_list, self.filtered_process_list

    @staticmethod
    def get_process_info() -> List[CpuProcessContainer]:
        # pids: gpu using process ids
        process_list = []

        try:
            # to measure cpu_percent, we need to wait 0.1 second
            process_iteration = psutil.process_iter()
            for p in process_iteration:
                _ = p.cpu_percent()

            sleep(0.1)
            for p in psutil.process_iter():
                each_cpu_process_container = CpuProcessContainer(
                    cpu=p.cpu_percent(),
                    memory=p.memory_percent(),
                    name=p.cmdline(),
                    pid=p.pid,
                    start=datetime.fromtimestamp(p.create_time()).strftime("%Y/%m/%d %H:%M:%S"),
                    status=p.status(),
                    user=p.username()
                )
                process_list.append(each_cpu_process_container)
        except Exception as e:
            warnings.warn(str(e))

        return process_list

    def get_filtered_process_info(self):
        if len(self.process_list) == 0:
            self.process_list = self.get_process_info()

        # 研究室メンバーによるプロセスとそれ以外を分ける
        # members_process, non_members_process = [], []
        # for each_process in self.process_list:
        #     if each_process.user in self.user_names:
        #         members_process.append(each_process)
        #     else:
        #         non_members_process.append(each_process)

        # CPU top 5 and memory usage top 5 (研究室メンバーを除く)
        # top_process_list = sorted(non_members_process, key=lambda x: x.cpu)[::-1][:6]
        # top_process_list += sorted(non_members_process, key=lambda x: x.memory)[::-1][:5]

        # 重複除去
        top_pids = set()
        filtered_process_list: List[CpuProcessContainer] = []
        for each_process in top_process_list:
            if each_process.pid in top_pids:
                continue
            else:
                filtered_process_list.append(each_process)
                top_pids.add(each_process.pid)
        filtered_process_list += members_process
        return filtered_process_list
