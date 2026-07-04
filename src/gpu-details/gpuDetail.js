import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import GpuInfo from "./gpuInfo";
import GpuDetailHeader from "./gpuDetailHeader";
import TopProcessTable from "./topProcessTable";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import { StyledPaper } from "./common";
import { LoadingCircle } from "../utils/utils";
import NodeStats from "./nodeStats";
import { useRecoilValue } from "recoil";
import { betaFeatureState } from "../atom/atom";
import { useData } from "../context";
import {getNodeData} from "../api";
import {Link} from "react-router-dom";

export default function GpuDetail() {
    const [nodeInfo, setNodeInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const useBetaFeature = useRecoilValue(betaFeatureState).tmp;
    const { name } = useParams();
    const location = useLocation();
    const timestamp = new URLSearchParams(location.search).get("timestamp");
    const { setState } = useData();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getNodeData(name, timestamp);
                setNodeInfo(res.data);
                setState({ cardContainerData: null, gpuDetails: res.data });
            } catch {
                setNodeInfo(false);
            }
        };

        fetchData();
        const timer = setTimeout(() => setIsLoading(true), 1000);
        return () => clearTimeout(timer);
    }, [name, setState, timestamp]);

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
        <Grid container justifyContent="center" alignItems="flex-start" spacing={{xs: 1.5, sm: 2}} sx={{width: "100%"}}>
            {gpuInfoChunks.left.length > 0 && (
                <Grid item md={6} xs={12}>
                    {renderGpuInfo(gpuInfoChunks.left)}
                </Grid>
            )}
            {gpuInfoChunks.right.length > 0 && (
                <Grid item md={6} xs={12}>
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

    const OutdatedLogBanner = () => {
        if (timestamp === null) {
            return null;
        }

        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: {xs: "calc(100% - 32px)", sm: "100%"},
                    maxWidth: {xs: "calc(100% - 32px)", md: "80%", lg: "1120px"},
                    px: {xs: 1.25, sm: 2},
                    py: 0.75,
                    mt: {xs: 0.25, sm: 0.5},
                    mb: {xs: 1.5, sm: 1.5},
                    border: "1px solid",
                    borderColor: "#fca70a",
                    color: "#ffd08a",
                    backgroundColor: "rgba(252, 167, 10, 0.10)",
                    boxSizing: "border-box",
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: {xs: "nowrap", sm: "normal"},
                    }}
                >
                    Viewing archived data. Latest is{" "}
                    <Link to={"/" + name} style={{color: "inherit", fontWeight: 700}}>
                        here
                    </Link>
                    .
                </Typography>
            </Box>
        );
    };

    return (
        <Stack direction="column" spacing={1} alignItems="center" justifyContent="center" marginBottom={4} sx={{px: {xs: 2, sm: 2, md: 3}, pt: {xs: 2, sm: 2}}}>
            <GpuDetailHeader
                name={name}
                osData={nodeInfo.basic_info}
                time={nodeInfo.basic_info.time}
                status={nodeInfo.basic_info.status}
                timestamp={timestamp}
                nvidia_driver_ver={nodeInfo.gpu_info.length > 0 ? nodeInfo.gpu_info[0].driver_version : "N/A"}
                cuda={nodeInfo.basic_info.cuda_versions}
            />
            <OutdatedLogBanner />
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{width: "100%", maxWidth: {xs: "100%", md: "80%", lg: "1120px"}}}
            >
                {gpuInfoContainer()}
                <StyledPaper
                    elevation={0}
                    sx={{
                        marginTop: "20px",
                        width: {xs: "100%", sm: "fit-content"},
                        overflow: "hidden",
                        backgroundColor: {xs: "rgba(27, 41, 58, 0.92)", sm: "rgba(27, 41, 58, 0.55)"},
                        borderColor: {xs: "#6fa4ff", sm: "divider"},
                        boxShadow: {xs: "inset 0 0 0 1px rgba(111, 164, 255, 0.16)", sm: "none"},
                    }}
                >
                    <TopProcessTable processes={nodeInfo.process_info} />
                </StyledPaper>
            </Stack>
            {useBetaFeature && <NodeStats />}
        </Stack>
    );
}
