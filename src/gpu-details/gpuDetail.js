import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import axios from "axios";
import Stack from "@mui/material/Stack";
import GpuInfo from "./gpuInfo";
import GpuDetailHeader from "./gpuDetailHeader";
import TopProcessTable from "./topProcessTable";
import { Alert, AlertTitle } from "@mui/material";
import { StyledPaper } from "./common";
import { LoadingCircle } from "../utils/utils";
import NodeStats from "./nodeStats";
import { useRecoilValue } from "recoil";
import { betaFeatureState } from "../atom/atom";
import { useData } from "../context";

export default function GpuDetail() {
    const [nodeInfo, setNodeInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const useBetaFeature = useRecoilValue(betaFeatureState).tmp;
    const { name } = useParams();
    const location = useLocation();
    const timestamp = new URLSearchParams(location.search).get("timestamp");
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
    const { setState } = useData();

    useEffect(() => {
        const fetchData = async () => {
            const url = timestamp
                ? `${apiBaseUrl}/log/?n=${name}&t=${timestamp}`
                : `${apiBaseUrl}/node/?n=${name}&_=${new Date().getTime()}`;

            try {
                const res = await axios.get(url, {
                    mode: 'cors',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                });
                setNodeInfo(res.data);
                setState({ cardContainerData: null, gpuDetails: res.data });
            } catch (err) {
                console.error("Error fetching data:", err);
                setNodeInfo(false);
            }
        };

        fetchData();
        const timer = setTimeout(() => setIsLoading(true), 1000);
        return () => clearTimeout(timer);
    }, [name, apiBaseUrl, setState, timestamp]);

    if (nodeInfo === false) {
        return (
            <Grid container justifyContent="center" alignItems="center" spacing={2}>
                <Grid item md={8}>
                    <Alert severity="error" sx={{ margin: "20px 0" }} variant="outlined">
                        <AlertTitle>Error</AlertTitle>
                        {timestamp
                            ? "The log data for the specified timestamp does not exist. Please check your query parameters."
                            : "The node data does not exist or is unavailable. Please verify the node name."}
                    </Alert>
                </Grid>
            </Grid>
        );
    }

    if (nodeInfo === null) {
        return isLoading ? <LoadingCircle /> : <div />;
    }

    const renderGpuInfo = (gpus) => (
        <Stack direction="column">
            {gpus.map((gpuData) => (
                <GpuInfo
                    id={parseInt(gpuData.gpu_id)}
                    key={parseInt(gpuData.gpu_id)}
                    gpuData={gpuData}
                />
            ))}
        </Stack>
    );

    const gpuInfoChunks = nodeInfo.gpu_info.reduce(
        (chunks, gpuData, index) => {
            index < nodeInfo.gpu_info.length / 2
                ? chunks.left.push(gpuData)
                : chunks.right.push(gpuData);
            return chunks;
        },
        { left: [], right: [] }
    );

    const gpuInfoContainer = () => (
        <Grid container justifyContent="center" alignItems="flex-start" spacing={2}>
            {gpuInfoChunks.left.length > 0 && (
                <Grid item md={6} xs={10}>
                    {renderGpuInfo(gpuInfoChunks.left)}
                </Grid>
            )}
            {gpuInfoChunks.right.length > 0 && (
                <Grid item md={6} xs={10}>
                    {renderGpuInfo(gpuInfoChunks.right)}
                </Grid>
            )}
            {!gpuInfoChunks.left.length && !gpuInfoChunks.right.length && (
                <Grid item md={8} lg={5}>
                    <Alert severity="warning" sx={{ margin: "20px 0", border: "1px solid #fca70a" }}>
                        <AlertTitle>Warning</AlertTitle>
                        There is no GPU data to be displayed.
                    </Alert>
                </Grid>
            )}
        </Grid>
    );

    return (
        <Stack direction="column" spacing={1} alignItems="center" justifyContent="center" marginBottom={4}>
            <GpuDetailHeader
                name={name}
                osData={nodeInfo.basic_info}
                time={nodeInfo.basic_info.time}
                status={nodeInfo.basic_info.status}
                timestamp={timestamp}
                nvidia_driver_ver={nodeInfo.gpu_info.length > 0 ? nodeInfo.gpu_info[0].driver_version : "N/A"}
                cuda={nodeInfo.basic_info.cuda_versions}
            />
            <Stack direction="column" justifyContent="center" alignItems="center">
                {gpuInfoContainer()}
                <StyledPaper elevation={0} sx={{ marginTop: "20px" }}>
                    <TopProcessTable processes={nodeInfo.process_info} />
                </StyledPaper>
            </Stack>
            {useBetaFeature && <NodeStats />}
        </Stack>
    );
}
