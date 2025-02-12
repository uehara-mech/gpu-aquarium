import React, {useEffect} from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {selector, useRecoilValue} from "recoil";
import {FilterState, gpuState, sortDirectionState, sortState, showHiddenNodeState} from "../atom/atom";

import GpuCard from './gpuCard';
import {getMemoryTotal, LoadSettings, StyledWarningAlert, useLoadSettings} from "../utils/utils";
import {calcGpuStatus} from "./gpuDenseIcon";
import {Alert, Box} from "@mui/material";

const serverStatusCalculator = (serverData) => {
    let serverStatus = {
        'free': 0,
        'used': 0,
        'alert': 0
    };
    for (let i = 0; i < serverData.gpu_info.length; i++) {
        let eachGpuStatus = calcGpuStatus(serverData.gpu_info[i]);
        serverStatus[eachGpuStatus] += 1;
    }
    return serverStatus;
};

const createGpuCard = selector({
    key: 'createGpuCard',
    get: ({get}) => {
        const serverInfo = get(gpuState);
        const filterInfo = get(FilterState);
        const sortInfo = get(sortState)["fixed"];
        const showHiddenNode = get(showHiddenNodeState)["fixed"];

        // sort serverInfo
        // first, copy serverInfo and convert to list
        let serverInfoList = [];
        for (let hostName in serverInfo) {
            if (serverInfo === undefined || serverInfo === null) {
                // do nothing
            } else if (serverInfo[hostName] === undefined || serverInfo[hostName] === null) {
                // do nothing
            } else {
                serverInfoList.push(serverInfo[hostName]);
            }
        }

        // second, sort serverInfoList
        if (serverInfoList.length > 0) {
            if (sortInfo === "gpu_type") {
                serverInfoList.sort((a, b) => {
                    if (a.basic_info.gpu_name.toLowerCase() < b.basic_info.gpu_name.toLowerCase()) return -1;
                    if (a.basic_info.gpu_name.toLowerCase() > b.basic_info.gpu_name.toLowerCase()) return 1;
                    return 0;
                });
            } else if (sortInfo === "gpu_usage") {
                serverInfoList.sort((a, b) => {
                    let aStatus = serverStatusCalculator(a);
                    let bStatus = serverStatusCalculator(b);

                    // first priority of sort: "free" (descending)
                    // second priority of sort: "alert" (ascending)
                    if (aStatus['free'] > bStatus['free']) return -1;
                    if (aStatus['free'] < bStatus['free']) return 1;
                    if (aStatus['alert'] < bStatus['alert']) return -1;
                    if (aStatus['alert'] > bStatus['alert']) return 1;
                    return 0;
                });
            } else if (sortInfo === "cpu_usage") {
                serverInfoList.sort((a, b) => {
                    if (a.basic_info.node_cpu_usage < b.basic_info.node_cpu_usage) return -1;
                    if (a.basic_info.node_cpu_usage > b.basic_info.node_cpu_usage) return 1;
                    return 0;
                });
            } else if (sortInfo === "cpu_memory") {
                serverInfoList.sort((a, b) => {
                    if (a.basic_info.node_cpu_memory < b.basic_info.node_cpu_memory) return -1;
                    if (a.basic_info.node_cpu_memory > b.basic_info.node_cpu_memory) return 1;
                    return 0;
                });
            } else {
                serverInfoList.sort((a, b) => {
                    if (a.basic_info.host_name.toLowerCase() < b.basic_info.host_name.toLowerCase()) return -1;
                    if (a.basic_info.host_name.toLowerCase() > b.basic_info.host_name.toLowerCase()) return 1;
                    return 0;
                });
            }
        }

        const gpuCards = [];
        // serverInfo: dict of {name1: {...}, name2, {...}, ...}
        if (serverInfoList.length > 0) {
            for (let i = 0; i < serverInfoList.length; i++) {
                let eachServerInfo = serverInfoList[i];
                let gpuName = eachServerInfo.basic_info.gpu_name;
                let memoryTotalStr = "N/A";
                if (eachServerInfo.gpu_info.length !== 0) {
                    memoryTotalStr = getMemoryTotal(eachServerInfo.gpu_info[0].memory_total);
                }
                let cudaVersions = eachServerInfo.basic_info.cuda_versions;

                // filter server
                if (filterInfo['gpu'].length > 0 && filterInfo['gpu'].includes(gpuName)) {
                    continue;
                }
                if (filterInfo['memory'].length > 0 && filterInfo['memory'].includes(memoryTotalStr)) {
                    continue;
                }
                // for cuda version, if filterInfo['cuda'] contains all cudaVersions, then skip
                if (filterInfo['cuda'].length > 0) {
                    let isSubset = cudaVersions.every(x => filterInfo['cuda'].includes(x));
                    if (isSubset) {
                        continue;
                    }
                }

                // for container,
                // 1. filterInfo['container'] = ["Docker", "Singularity"]
                // -> do nothing (show all)
                // 2. filterInfo['container'] != ["Docker"]
                // -> if is_docker_available is false, then skip
                // 3. filterInfo['container'] != ["Singularity"]
                // -> if is_singularity_available is false, then skip
                // 4. filterInfo['container'] = []
                // -> show is_docker_available and is_singularity_available
                if (filterInfo['container'].length > 0) {
                    if (filterInfo['container'].includes("Docker") && filterInfo['container'].includes("Singularity")) {
                        // do nothing
                    } else if (!filterInfo['container'].includes("Docker")) {
                        if (!eachServerInfo.basic_info.is_docker_available) {
                            continue;
                        }
                    } else if (!filterInfo['container'].includes("Singularity")) {
                        if (!eachServerInfo.basic_info.is_singularity_available) {
                            continue;
                        }
                    }
                } else {
                    if (!eachServerInfo.basic_info.is_docker_available || !eachServerInfo.basic_info.is_singularity_available) {
                        continue;
                    }
                }

                gpuCards.push(
                    <Grid item xs={12} md={12} key={i}><GpuCard data={eachServerInfo}/></Grid>
                );
            }
        }
        return [gpuCards, serverInfoList];
    }
});

export default function CardContainer(props) {
    const [gpuCards, serverInfoList] = useRecoilValue(createGpuCard);

    console.log(serverInfoList);

    // useLoadSettings();

    // divide gpuCards into two columns
    // 1. get sort direction from atom
    const sortDirection = useRecoilValue(sortDirectionState)["fixed"];
    // 2. divide gpuCards into two columns
    let leftGpuCards = [];
    let rightGpuCards = [];
    if (sortDirection === "column") {
        // divide by half
        for (let i = 0; i < gpuCards.length; i++) {
            if (i < gpuCards.length / 2) {
                leftGpuCards.push(gpuCards[i]);
            } else {
                rightGpuCards.push(gpuCards[i]);
            }
        }
    } else {
        // divide by odd and even
        for (let i = 0; i < gpuCards.length; i++) {
            if (i % 2 === 0) {
                leftGpuCards.push(gpuCards[i]);
            } else {
                rightGpuCards.push(gpuCards[i]);
            }
        }
    }

    const gpuContainer = () => {
        if (serverInfoList.length > 0 && gpuCards.length === 0) {
            return (
                <Box sx={{width: "100%", display: "flex", justifyContent: "center"}}>
                    <StyledWarningAlert severity="warning">
                        There is no Server data to be displayed.
                        You may need to check the filter settings.
                    </StyledWarningAlert>
                </Box>
            );
        } else if (serverInfoList.length === 0) {
            return (
                <Box sx={{width: "100%", display: "flex", justifyContent: "center"}}>
                    <StyledWarningAlert severity="warning">
                        There is no Server data to be displayed.
                        Maybe the server is down, please contact the administrator.
                    </StyledWarningAlert>
                </Box>
            );
        } else {
            return (
                <Grid container justifyContent={"center"}>
                    <Grid item md={10} lg={5} xs={10}>
                        <Grid container spacing={0} sx={{paddingTop: "8px"}}>
                            {leftGpuCards}
                        </Grid>
                    </Grid>
                    <Grid item md={10} lg={5} xs={10}>
                        <Grid container spacing={0}  sx={{paddingTop: "8px"}}>
                            {rightGpuCards}
                        </Grid>
                    </Grid>
                </Grid>
            );
        }
    };

    return (
        <div style={{marginBottom: "32px"}}>
            {gpuContainer()}
        </div>
    );
}
