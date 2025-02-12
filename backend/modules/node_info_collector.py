import glob
import logging
import os
import platform
import shutil
import subprocess
import sys
import warnings
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from time import sleep
from typing import Optional, Dict, Any, List, Union, Set

import distro as distro
import psutil
import xmltodict
from ping3 import ping

log = logging.getLogger('rich')

@dataclass
class NodeInfoContainer:
    """
    A container to hold all collected node information.
    """
    basic_info: "BasicInfoContainer"
    process_info: List["ProcessContainer"]
    gpu_info: List["GpuInfoContainer"]
    file_server_info: List["FileServerInfoContainer"]
    storage_io_info: List["StorageIOContainer"]

@dataclass
class BasicInfoContainer:
    """
    Contains basic node information such as OS details, memory usage, and CUDA availability.
    """
    os: Optional[str] = None
    host_name: Optional[str] = None
    uname: Optional[str] = None
    node_cpu_memory_total: Optional[str] = None
    node_cpu_memory_used: Optional[str] = None
    node_cpu_swap_total: Optional[str] = None
    node_cpu_swap_used: Optional[str] = None
    cpu_core_count: Optional[int] = None
    ram_total: Optional[str] = None
    status: Optional[str] = None
    node_cpu_usage: Optional[str] = None
    node_cpu_memory: Optional[str] = None
    time: Optional[str] = None
    cuda_versions: List[str] = field(default_factory=list)
    default_cuda_version: Optional[str] = None
    is_docker_available: bool = False
    is_singularity_available: bool = False

    def check(self):
        """
        Check if all attributes are set; warns for unset attributes.
        """
        for k, v in self.__dict__.items():
            if v is None:
                warnings.warn(f"{k} is not set")

@dataclass
class ProcessContainer:
    """
    Represents information about a process running on the node.
    """
    cpu: Optional[str] = None
    cpu_memory: Optional[str] = None
    process_name: Optional[str] = None
    process_type: Optional[str] = None
    process_id: Optional[str] = None
    start_time: Optional[str] = None
    status: Optional[str] = None
    user: Optional[str] = None
    is_gpu_process: bool = False
    gpu_memory: Optional[str] = None

    def __post_init__(self):
        """
        Determine the process type based on the process name.
        """
        if self.process_name is not None:
            # Determine the type of process based on known patterns in the name
            if 'ipykernel' in self.process_name or 'jupyter' in self.process_name:
                self.process_type = 'jupyter'
            elif 'python' in self.process_name:
                self.process_type = 'python'
            elif '.vscode-server' in self.process_name:
                self.process_type = 'vscode'
            elif '/bin/bash' in self.process_name:
                self.process_type = 'bash'
            elif '/bin/sh' in self.process_name:
                self.process_type = 'sh'
            else:
                split_process_name = self.process_name.split()
                self.process_type = split_process_name[0] if split_process_name else self.process_name
                # Handle full paths in the process name
                if '/' in self.process_type:
                    self.process_type = self.process_type.split('/')[-1]
                self.process_type = self.process_type.lower()

@dataclass
class GpuInfoContainer:
    """
    Holds information about GPU usage and properties.
    """
    fan_speed: Optional[str] = None
    gpu_id: Optional[str] = None
    gpu_name: Optional[str] = None
    gpu_power_draw: Optional[str] = None
    gpu_power_limit: Optional[str] = None
    gpu_temperature: Optional[str] = None
    gpu_util: Optional[str] = None
    memory_free: Optional[str] = None
    memory_total: Optional[str] = None
    memory_used: Optional[str] = None
    driver_version: Optional[str] = None
    processes: List[ProcessContainer] = field(default_factory=list)

@dataclass
class FileServerInfoContainer:
    """
    Contains information about file server availability and response time.
    """
    target_host: Optional[str] = None
    source_host: Optional[str] = None
    ping_result: float = 0.0

@dataclass
class StorageIOContainer:
    """
    Represents storage I/O metrics such as read and write bytes.
    """
    device_name: Optional[str] = None
    read_bytes: Optional[int] = None
    write_bytes: Optional[int] = None

class StorageIOCollector:
    """
    Collects I/O statistics for all storage devices using `psutil`.
    """
    def __init__(self, disable=False):
        self.disable = disable

    def collect(self) -> List[StorageIOContainer]:
        """
        Collect I/O statistics for all detected storage devices.

        Returns:
            List[StorageIOContainer]: List of storage device I/O information.
        """
        if self.disable:
            return []
        storage_info = []
        try:
            # Use psutil to get per-disk I/O counters
            disk_counters = psutil.disk_io_counters(perdisk=True)
            for device, counters in disk_counters.items():
                storage_info.append(StorageIOContainer(
                    device_name=device,
                    read_bytes=counters.read_bytes,
                    write_bytes=counters.write_bytes
                ))
        except Exception as e:
            warnings.warn(str(e))
        return storage_info


class GpuInfoCollector:
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.is_nvidia_smi_available = check_command_existence('nvidia-smi')

        if not self.is_nvidia_smi_available:
            warnings.warn('nvidia-smi is not available')

        self.driver_version = self.run_nvidia_smi().get('driver_version', "")

    def nvidia_smi(self) -> str:
        if not self.is_nvidia_smi_available:
            return ""
        else:
            try:
                nvidia_smi_output = subprocess.run(['nvidia-smi', '-q', '-x'], stdout=subprocess.PIPE, timeout=30)
                nvidia_smi_result: str = nvidia_smi_output.stdout.decode()
                return nvidia_smi_result
            except Exception as e:
                warnings.warn(str(e))
                return ""

    def run_nvidia_smi(self) -> Dict:
        """
        run nvidia-smi command
        Returns:
            [`Dict`]: parsed nvidia-smi output
        """
        nvidia_smi_result = self.nvidia_smi()
        if nvidia_smi_result == "":
            return {}

        parsed_nvidia_smi: Dict = xmltodict.parse(nvidia_smi_result, force_list=('gpu'))
        nvidia_smi_log: Dict = parsed_nvidia_smi.get('nvidia_smi_log', None)
        return nvidia_smi_log

    def fetch_container(
            self,
            gpu_id: int,
            gpu_info_dict: Dict[str, Any],
            processes: List[ProcessContainer] = None
    ) -> GpuInfoContainer:
        """
        fetch container information from nvidia-smi output for each gpu
        Returns:
            [`GpuInfoContainer`]: container information for each gpu
        """
        gpu_power_readings = gpu_info_dict.get('power_readings', {})
        gpu_power_draw = gpu_power_readings.get('power_draw', None)
        gpu_power_limit = gpu_power_readings.get('power_limit', None)

        gpu_temperature = gpu_info_dict.get('temperature', {}).get('gpu_temp', None)
        gpu_util = gpu_info_dict.get('utilization', {}).get('gpu_util', None)

        fb_memory_usage = gpu_info_dict.get('fb_memory_usage', {})

        # gather process information
        all_gpu_processes: List[ProcessContainer] = []
        if processes is not None:
            cpu_process_dic: Dict[str, ProcessContainer] = {
                x.process_id: x for x in processes
            }
            gpu_processes_dic = gpu_info_dict.get('processes', {})

            if gpu_processes_dic is not None:
                gpu_processes: Union[List[Dict], Dict] = gpu_processes_dic.get('process_info', [])
            else:
                gpu_processes = []

            if type(gpu_processes) is not list:
                gpu_processes = [gpu_processes]

            for each_gpu_process in gpu_processes:
                each_gpu_pid = each_gpu_process.get('pid', '')

                each_process_container = cpu_process_dic.get(each_gpu_pid, None)
                # update process information with gpu information
                if each_process_container is not None:
                    each_process_container.is_gpu_process = True
                    each_process_container.gpu_memory = each_gpu_process.get('used_memory', None)
                    all_gpu_processes.append(each_process_container)

        return GpuInfoContainer(
            fan_speed=gpu_info_dict.get('fan_speed', None),
            gpu_id=str(gpu_id),
            gpu_name=gpu_info_dict.get('product_name', None),
            gpu_power_draw=gpu_power_draw,
            gpu_power_limit=gpu_power_limit,
            gpu_temperature=gpu_temperature,
            gpu_util=gpu_util,
            memory_free=fb_memory_usage.get('free', None),
            memory_total=fb_memory_usage.get('total', None),
            memory_used=fb_memory_usage.get('used', None),
            driver_version=self.driver_version,
            processes=all_gpu_processes
        )

    def collect_all(self, processes: List[ProcessContainer] = None) -> List[GpuInfoContainer]:
        """
        collect information of all gpus
        Returns:
            [`List[GpuInfoContainer]`]: list of container information of all gpus
        """
        nvidia_smi_log = self.run_nvidia_smi()
        all_gpu_info = nvidia_smi_log.get('gpu', None)

        if all_gpu_info is None:
            return []

        gpu_containers: List[GpuInfoContainer] = []
        num_gpus = len(all_gpu_info)
        for gpu_id in range(num_gpus):
            each_gpu_container = self.fetch_container(
                gpu_id=gpu_id, gpu_info_dict=all_gpu_info[gpu_id],
                processes=processes
            )
            gpu_containers.append(each_gpu_container)
        return gpu_containers

class ProcessInfoCollector:
    def __init__(
            self,
            system_username_list=None,
            hide_sshd=True,
            hide_shell=True
    ):
        default_system_username_list = [
            'root', None, 'messagebus', 'mosquitto',
            '_rpc', 'kernoops', 'systemd-timesync', 'systemd-network',
            'systemd-resolve', 'statd', 'syslog', '_lldpd',
            'nvidia-persistenced'
        ]
        self.system_username_list: Set[str]
        if system_username_list is None:
            # TODO: load from config file
            self.system_username_list = set(default_system_username_list)
        else:
            self.system_username_list = set(default_system_username_list + system_username_list)

        self.hide_sshd = hide_sshd
        self.hide_shell = hide_shell
        self.shell_process_name: Set[str] = {
            "-bash", "-zsh", "-sh", "-csh", "-tcsh", "-fish", "-dash", "-ksh",
            "/bin/bash", "/bin/zsh", "/bin/sh", "/bin/csh", "/bin/tcsh", "/bin/fish", "/bin/dash", "/bin/ksh",
            "-/bin/bash", "-/bin/zsh", "-/bin/sh", "-/bin/csh", "-/bin/tcsh", "-/bin/fish", "-/bin/dash", "-/bin/ksh",
        }
        self.nis_users: Set[str] = self.get_nis_users()

    def get_nis_users(self) -> Set[str]:
        try:
            # run ypcat passwd to get the list of NIS users
            result = subprocess.run(['ypcat', 'passwd'], stdout=subprocess.PIPE, text=True, check=True)
            # extract usernames from the output
            users = [line.split(':')[0] for line in result.stdout.splitlines()]
        except subprocess.CalledProcessError as e:
            print(f"An error occurred while running ypcat: {e}")
            users = []
        return set(users)

    def collect_all(self) -> List[ProcessContainer]:
        process_list = []
        try:
            # to measure cpu_percent, we need to wait 0.1 second
            process_iteration = psutil.process_iter()
            for p in process_iteration:
                _ = p.cpu_percent()

            sleep(0.1)
            for p in psutil.process_iter():
                process_name = ' '.join(p.cmdline())

                # skip system process
                if p.username() in self.system_username_list:
                    continue
                if p.username() not in self.nis_users:
                    continue
                if self.hide_sshd and 'sshd' in process_name:
                    continue
                if self.hide_shell and process_name in self.shell_process_name:
                    continue

                start_time = datetime.fromtimestamp(
                    p.create_time(), tz=timezone(timedelta(hours=+9))
                ).strftime("%Y/%m/%d %H:%M:%S")

                each_cpu_process_container = ProcessContainer(
                    cpu=str(p.cpu_percent()),
                    cpu_memory=str(p.memory_percent()),
                    process_name=process_name,
                    process_id=str(p.pid),
                    start_time=start_time,
                    status=p.status(),
                    user=p.username()
                )
                process_list.append(each_cpu_process_container)
        except Exception as e:
            warnings.warn(str(e))

        return process_list


class NodeInfoCollector:
    """
    Collects comprehensive information about the node, including basic details, processes,
    GPU stats, file server connectivity, and storage I/O metrics.
    """
    def __init__(self):
        # Initialize individual collectors for different aspects of node information
        self.basic_collector = BasicInfoCollector()
        self.gpu_collector = GpuInfoCollector()
        self.process_collector = ProcessInfoCollector()
        self.storage_io_collector = StorageIOCollector(disable=True)

    def collect(self) -> NodeInfoContainer:
        """
        Collect all node-related information and construct a NodeInfoContainer.

        Returns:
            NodeInfoContainer: Consolidated information about the node.
        """
        log.debug("collecting node information")
        # Collect basic system information
        basic_info = self.basic_collector.collect()

        log.debug("collecting process information")
        # Collect information about all processes
        all_process_info = self.process_collector.collect_all()
        log.debug(f"collected {len(all_process_info)} processes!")

        log.debug("collecting GPU information")
        # Collect information about GPUs, associating with process info where applicable
        all_gpu_info = self.gpu_collector.collect_all(all_process_info)
        log.debug(f"collected {len(all_gpu_info)} GPUs!")

        log.debug("collecting storage IO information")
        # Collect storage I/O metrics
        all_storage_io_info = self.storage_io_collector.collect()
        log.debug(f"collected {len(all_storage_io_info)} storage devices!")

        # Construct a container with all collected information
        node_info = NodeInfoContainer(
            basic_info=basic_info,
            process_info=all_process_info,
            gpu_info=all_gpu_info,
            file_server_info=[],
            storage_io_info=all_storage_io_info
        )
        log.debug("constructed node information!")
        return node_info

class BasicInfoCollector:
    """
    Collects basic system information such as OS, memory, and CPU details.
    """
    def __init__(self):
        # Collect static system details at initialization
        self.os_name = self.get_os()
        self.host_name = self.get_host_name()
        self.uname = self.get_uname()

        self.basic_info = BasicInfoContainer(
            os=self.os_name,
            host_name=self.host_name,
            uname=self.uname
        )

    @staticmethod
    def get_os() -> str:
        """
        Determine the operating system name and version.

        Returns:
            str: Full OS name and version.
        """
        os_name = platform.system()

        if os_name == "Linux":
            # Use distro to get detailed OS info on Linux
            os_name = distro.name()
            with open("/etc/os-release") as f:
                os_release = {}
                for line in f:
                    k, v = line.rstrip().split("=")
                    os_release[k] = v.strip('"')
                os_version = os_release['VERSION']
            os_fullname = f"{os_name} {os_version}"
        elif os_name == "Windows":
            os_fullname = f"Windows {platform.release()}"
        elif os_name == "Darwin":
            mac_version = platform.mac_ver()[0]
            os_fullname = f"macOS {mac_version}"
        else:
            os_fullname = "Unknown OS"

        return os_fullname

    @staticmethod
    def get_uname() -> str:
        """
        Get the platform release information.

        Returns:
            str: Platform release string.
        """
        uname = platform.release()
        return uname

    @staticmethod
    def get_host_name():
        """
        Get the host name of the machine.

        Returns:
            str: Host name.
        """
        return os.uname()[1]

    @staticmethod
    def get_time():
        """
        Get the current system time in the format YYYY/MM/DD HH:MM:SS.

        Returns:
            str: Current time.
        """
        return datetime.now(timezone(timedelta(hours=+9))).strftime("%Y/%m/%d %H:%M:%S")

    @staticmethod
    def get_available_cuda() -> List[str]:
        """
        Get a list of available CUDA versions installed on the system.

        Returns:
            List[str]: List of available CUDA versions.
        """
        cuda_dir_list = glob.glob('/usr/local/cuda-*')
        available_cuda = sorted([x.split('-')[-1] for x in cuda_dir_list], key=lambda x: float(x))
        return available_cuda

    @staticmethod
    def get_default_cuda() -> str:
        """
        Get the default CUDA version from the symbolic link.

        Returns:
            str: Default CUDA version or "N/A" if not found.
        """
        if not os.path.exists('/usr/local/cuda'):
            warnings.warn("cuda path /usr/local/cuda does not exist")
            return "N/A"
        default_cuda = os.readlink('/usr/local/cuda').split('-')[-1].strip('/')
        return default_cuda

    @staticmethod
    def format_size(size):
        """
        Format a size in bytes into a human-readable string.

        Args:
            size (int): Size in bytes.

        Returns:
            str: Human-readable size string.
        """
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024:
                break
            size /= 1024
        return f"{size:.2f} {unit}"

    def collect(self) -> BasicInfoContainer:
        """
        Collect all basic system information.

        Returns:
            BasicInfoContainer: Container with basic system details.
        """
        self.basic_info.time = self.get_time()
        # Collect CPU usage percentage
        self.basic_info.node_cpu_usage = psutil.cpu_percent()

        # Collect memory information
        memory_info = psutil.virtual_memory()
        self.basic_info.node_cpu_memory = memory_info.percent
        self.basic_info.node_cpu_memory_total = self.format_size(memory_info.total)
        self.basic_info.node_cpu_memory_used = self.format_size(memory_info.used)

        # Collect swap memory details
        swap_info = psutil.swap_memory()
        self.basic_info.node_cpu_swap_total = self.format_size(swap_info.total)
        self.basic_info.node_cpu_swap_used = self.format_size(swap_info.used)

        # Collect CPU core count and total RAM
        self.basic_info.cpu_core_count = psutil.cpu_count(logical=True)
        self.basic_info.ram_total = self.format_size(memory_info.total)

        # Collect CUDA version details
        self.basic_info.cuda_versions = self.get_available_cuda()
        self.basic_info.default_cuda_version = self.get_default_cuda()

        # Check Docker and Singularity availability
        self.basic_info.is_docker_available = check_command_existence('docker')
        self.basic_info.is_singularity_available = check_command_existence('singularity')

        # Set status to operational
        self.basic_info.status = 'operational'
        self.basic_info.check()

        return self.basic_info

def check_command_existence(command: str) -> bool:
    """
    Check if a command exists in the system's PATH.

    Args:
        command (str): Command name.

    Returns:
        bool: True if the command exists, False otherwise.
    """
    return shutil.which(command) is not None
