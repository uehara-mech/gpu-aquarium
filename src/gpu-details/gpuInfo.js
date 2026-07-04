import React from 'react';
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {styled} from "@mui/material/styles";
import {LinearProgress, linearProgressClasses} from "@mui/material";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";



import GpuProcessTable from './gpuProcessTable';
import Divider from "@mui/material/Divider";
import {StyledPaper} from "./common";
// import GpuGraphBar from './gpuGraphBar';


const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 13,
  borderRadius: 7,
    borderColor: theme.palette.progress.border,
    borderWidth: 1.2,
    borderStyle: 'solid',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 100 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 0,
    backgroundColor: theme.palette.progress.background
  },
}));


const GpuGraphBar = (percentage) => {
    return (
        <BorderLinearProgress
            variant="determinate"
            value={percentage}
            sx={{width: "100%", minWidth: 0}}
        />
    )
}

const GpuMetricGrid = ({gpuUtil, memoryPer, memoryLabel}) => (
    <Box
        sx={{
            display: "grid",
            gridTemplateColumns: "minmax(96px, 1fr) max-content",
            alignItems: "center",
            columnGap: 1,
            rowGap: 0.25,
            width: "100%",
            maxWidth: {xs: "100%", sm: 390},
            minWidth: 0,
        }}
    >
        {GpuGraphBar(gpuUtil)}
        <Typography
            variant='body2'
            noWrap
            sx={{
                flexShrink: 0,
                fontSize: {xs: "0.78rem", sm: "0.875rem"},
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {gpuUtil}%
        </Typography>
        {GpuGraphBar(memoryPer)}
        <Typography
            variant='body2'
            noWrap
            sx={{
                flexShrink: 0,
                fontSize: {xs: "0.78rem", sm: "0.875rem"},
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {memoryLabel}
        </Typography>
    </Box>
);


export default function GpuInfo(props) {
    const serverInfo = props.gpuData;
    const gpuKey = props.id.toString(10);
    const memoryTotal = parseInt(serverInfo.memory_total, 10);
    const memoryUsed = parseInt(serverInfo.memory_used, 10);
    const memoryPer = (memoryUsed / memoryTotal) * 100;
    const gpuUtil = parseInt(serverInfo.gpu_util, 10);
    const gpuTemp = 'Temp: ' + serverInfo.gpu_temperature;
    const processes = serverInfo.processes;

    return (
        <div style={{width: "100%"}}>
            <StyledPaper sx={{padding: {xs: "14px", sm: "14px"}, marginTop: "10px", marginBottom: "10px", width: "100%", boxSizing: "border-box"}} elevation={0}>
                <Stack direction={"column"}>
                    <Stack direction={"row"} spacing={{xs: 1.25, sm: 1.5}} alignItems={"flex-start"}>
                        <Paper variant={"outlined"} sx={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: {xs: "30px", sm: "32px"}, height: {xs: "30px", sm: "32px"}, "borderWidth": "3px", flexShrink: 0
                        }}>
                            <Typography variant="body1" align="center" sx={{fontWeight: '500'}}>{gpuKey}</Typography>
                        </Paper>
                        <Stack direction={"column"} sx={{paddingLeft: {xs: 0, sm: "12px"}, minWidth: 0, flexGrow: 1}}>
                            <GpuMetricGrid
                                gpuUtil={gpuUtil}
                                memoryPer={memoryPer}
                                memoryLabel={`${memoryUsed}/${memoryTotal} MiB`}
                            />
                            <Stack
                                direction={"row"}
                                sx={{
                                    marginTop: {xs: "10px", sm: "8px"},
                                    flexWrap: "wrap",
                                    gap: {xs: 0.75, sm: 1},
                                    color: "text.secondary",
                                    minWidth: 0,
                                }}
                                spacing={0}
                            >
                                <Typography variant="caption" sx={{lineHeight: 1.35, whiteSpace: "nowrap"}}>
                                    {gpuTemp}
                                </Typography>
                                <Typography variant="caption" sx={{lineHeight: 1.35, opacity: 0.45}}>
                                    /
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        lineHeight: 1.35,
                                        minWidth: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: "100%",
                                    }}
                                >
                                    {serverInfo.gpu_name}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
                <div>
                    <Divider sx={{marginTop: {xs: "14px", sm: "10px"}, mx: {xs: 1.25, sm: 0}, opacity: 0.7}}/>
                    <GpuProcessTable processes={processes} />
                </div>
            </StyledPaper>
        </div>
    );
}
