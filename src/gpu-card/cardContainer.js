import React from 'react';

import Grid from '@mui/material/Grid';
import {selector, useRecoilValue} from "recoil";
import {FilterState, gpuState, sortDirectionState, sortState} from "../atom/atom";

import GpuCard from './gpuCard';
import {getMemoryTotal, StyledWarningAlert} from "../utils/utils";
import {calcGpuStatus} from "./gpuDenseIcon";
import {Box, useMediaQuery, useTheme} from "@mui/material";

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
        const gpuFilter = new Set(filterInfo.gpu);
        const memoryFilter = new Set(filterInfo.memory);
        const cudaFilter = new Set(filterInfo.cuda);
        const containerFilter = new Set(filterInfo.container);

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
                const statusByServer = new Map(
                    serverInfoList.map((server) => [server, serverStatusCalculator(server)])
                );
                serverInfoList.sort((a, b) => {
                    const aStatus = statusByServer.get(a);
                    const bStatus = statusByServer.get(b);

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

        const visibleServers = [];
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
                if (gpuFilter.size > 0 && gpuFilter.has(gpuName)) {
                    continue;
                }
                if (memoryFilter.size > 0 && memoryFilter.has(memoryTotalStr)) {
                    continue;
                }
                // for cuda version, if filterInfo['cuda'] contains all cudaVersions, then skip
                if (cudaFilter.size > 0) {
                    let isSubset = cudaVersions.every(x => cudaFilter.has(x));
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
                if (containerFilter.size > 0) {
                    if (containerFilter.has("Docker") && containerFilter.has("Singularity")) {
                        // do nothing
                    } else if (!containerFilter.has("Docker")) {
                        if (!eachServerInfo.basic_info.is_docker_available) {
                            continue;
                        }
                    } else if (!containerFilter.has("Singularity")) {
                        if (!eachServerInfo.basic_info.is_singularity_available) {
                            continue;
                        }
                    }
                } else {
                    if (!eachServerInfo.basic_info.is_docker_available || !eachServerInfo.basic_info.is_singularity_available) {
                        continue;
                    }
                }

                visibleServers.push(eachServerInfo);
            }
        }
        return [visibleServers, serverInfoList.length];
    }
});

export default function CardContainer(props) {
    const [visibleServers, serverCount] = useRecoilValue(createGpuCard);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const gpuCards = visibleServers.map((server) => (
        <Box
            key={server.basic_info.host_name}
            sx={{width: "100%", maxWidth: {xs: "100%", sm: 600}, minWidth: 0, display: "flex", justifyContent: "center", mx: "auto"}}
        >
            <GpuCard data={server}/>
        </Box>
    ));

    const sortDirection = useRecoilValue(sortDirectionState)["fixed"];
    let leftGpuCards = [];
    let rightGpuCards = [];
    if (sortDirection === "column") {
        for (let i = 0; i < gpuCards.length; i++) {
            if (i < gpuCards.length / 2) {
                leftGpuCards.push(gpuCards[i]);
            } else {
                rightGpuCards.push(gpuCards[i]);
            }
        }
    } else {
        for (let i = 0; i < gpuCards.length; i++) {
            if (i % 2 === 0) {
                leftGpuCards.push(gpuCards[i]);
            } else {
                rightGpuCards.push(gpuCards[i]);
            }
        }
    }

    const gpuContainer = () => {
        if (serverCount > 0 && gpuCards.length === 0) {
            return (
                <Box sx={{width: "100%", display: "flex", justifyContent: "center"}}>
                    <StyledWarningAlert severity="warning">
                        There is no Server data to be displayed.
                        You may need to check the filter settings.
                    </StyledWarningAlert>
                </Box>
            );
        } else if (serverCount === 0) {
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
                <Grid container justifyContent={"center"} sx={{px: {xs: 2, sm: 0}}}>
                    {!isDesktop && <Grid item md={10} xs={12} sx={{minWidth: 0}}>
                        <Box sx={{display: "grid", rowGap: 0, justifyItems: "center", paddingTop: "8px"}}>
                            {gpuCards}
                        </Box>
                    </Grid>}
                    {isDesktop && <Grid item lg={12} sx={{minWidth: 0}}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                columnGap: 0,
                                justifyContent: "center",
                                alignItems: "start",
                                width: "calc(100% - 96px)",
                                maxWidth: 1200,
                                minWidth: 0,
                                mx: "auto",
                                paddingTop: "8px",
                            }}
                        >
                            <Box sx={{display: "grid", rowGap: 0, justifyItems: "center", minWidth: 0}}>
                                {leftGpuCards}
                            </Box>
                            <Box sx={{display: "grid", rowGap: 0, justifyItems: "center", minWidth: 0}}>
                                {rightGpuCards}
                            </Box>
                        </Box>
                    </Grid>}
                </Grid>
            );
        }
    };

    return (
        <div style={{marginBottom: "32px", width: "100%", overflowX: "hidden"}}>
            {gpuContainer()}
        </div>
    );
}
