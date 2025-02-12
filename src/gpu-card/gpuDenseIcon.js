import React from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';


const GpuIcon = styled('div')(({ theme }) => ({
    margin: "1px 1px 1px 1px",
    height: "1rem",
    width: "25px",
    borderRadius: "10%"
}));


const FreeGpuIcon = styled(GpuIcon)(({ theme }) => ({
    backgroundColor: theme.palette.gpuIcon.free
}));

const UsedGpuIcon = styled(GpuIcon)(({ theme }) => ({
    backgroundColor: theme.palette.gpuIcon.used
}));

const AlertGpuIcon = styled(GpuIcon)(({ theme }) => ({
    backgroundColor: theme.palette.gpuIcon.alert
}));


export const calcGpuStatus = (serverInfo) => {
    let gpuUtil = serverInfo.gpu_util;
    gpuUtil = parseInt(gpuUtil, 10);

    const calcMemory = (mem) => {
        return parseFloat(mem.slice(0, mem.length-4));
    }
    let gpuMemoryUsed = calcMemory(serverInfo.memory_used);
    let gpuMemoryTotal = calcMemory(serverInfo.memory_total);
    let gpuMemoryPer = (gpuMemoryUsed / gpuMemoryTotal) * 100;

    if (gpuUtil < 10 && gpuMemoryPer < 10) {
        return "free";
    } else if (gpuUtil > 90 || gpuMemoryPer > 90) {
        return "alert";
    } else {
        return "used";
    }
}


export default function GpuDenseIcon(props) {
    const serverInfo = props.gpu;
    let gpuIcons = [];

    if (serverInfo.length > 0) {
        for (var i in serverInfo) {
            let gpuStatus = calcGpuStatus(serverInfo[i]);
            if (gpuStatus === "free") {
                gpuIcons.push(<FreeGpuIcon key={i} />)
            } else if (gpuStatus === "used") {
                gpuIcons.push(<UsedGpuIcon key={i} />)
            } else if (gpuStatus === "alert") {
                gpuIcons.push(<AlertGpuIcon key={i} />)
            } else {
                gpuIcons.push(<div>{"unknown"}</div>)
            }
        }
    }

    return (
        <div>
            <Stack direction={"row"} spacing={0}>
                {gpuIcons}
            </Stack>
        </div>
    )

}
