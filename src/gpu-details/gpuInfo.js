import React from 'react';
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import {styled} from "@mui/material/styles";
import {LinearProgress, linearProgressClasses} from "@mui/material";
import Stack from "@mui/material/Stack";



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
        <BorderLinearProgress variant="determinate" value={percentage} sx={{minWidth: 250}}/>
    )
}


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
        <div>
            <StyledPaper sx={{padding: "12px", marginTop: "8px", marginBottom: "8px"}} elevation={0}>
                <Stack direction={"column"}>
                    <Stack direction={"row"} spacing={1} alignItems="center">
                        <Paper variant={"outlined"} sx={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "32px", height: "32px", "borderWidth": "3px"
                        }}>
                            <Typography variant="body1" align="center" sx={{fontWeight: '500'}}>{gpuKey}</Typography>
                        </Paper>
                        <Stack direction={"column"} sx={{paddingLeft: "16px"}}>
                            <Stack direction={"row"} alignItems="center">
                                {GpuGraphBar(gpuUtil)}
                                <Typography variant='body2' sx={{marginLeft: "8px"}}>{gpuUtil}%</Typography>
                            </Stack>
                            <Stack direction={"row"} alignItems="center">
                                <div>
                                    {GpuGraphBar(memoryPer)}
                                </div>
                                <Typography variant='body2' noWrap sx={{marginLeft: "8px"}}>{memoryUsed}/{memoryTotal} MiB</Typography>
                            </Stack>
                            <Stack direction={"row"} sx={{marginTop: "8px"}} spacing={1}>
                                <Chip
                                    variant="outlined"
                                    size="small"
                                    label={gpuTemp}
                                />
                                <Chip
                                    variant="outlined"
                                    size="small"
                                    label={serverInfo.gpu_name}
                                />
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
                <div>
                    <Divider sx={{marginTop: "8px"}}/>
                    <GpuProcessTable processes={processes} />
                </div>
            </StyledPaper>
        </ div>
    );
}