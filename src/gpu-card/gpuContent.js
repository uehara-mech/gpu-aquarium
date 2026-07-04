import React from 'react';

import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import GpuCardTable from './gpuCardTable';
import GpuDenseIcon from './gpuDenseIcon';


const dispCpuInfo = (cpuInfo) => {
    try {
        return (
            "CPU Usage: " + cpuInfo.node_cpu_usage + "%, Memory: " + cpuInfo.node_cpu_memory + "%"
        )
    } catch (e) {
        return "";
    }
}

export default function GpuContent(props) {

    const serverInfo = props.data;

    const gpuList = serverInfo.gpu_info;

    return (
        <div>
            <Divider />
            <Accordion elevation={0} sx={{backgroundColor: "transparent"}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Stack direction={'row'} spacing={1} alignItems={"center"}>
                        <Chip
                            variant="outlined"
                            size="small"
                            label="GPU"
                        />
                        <GpuDenseIcon gpu={gpuList} />
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <GpuCardTable gpu={gpuList}/>
                </AccordionDetails>
            </Accordion>
            <Divider />
            <Stack direction={'row'} spacing={1} alignItems={"center"} sx={{padding: {xs: "12px", sm: "12px 16px"}, minWidth: 0}}>
                <Chip
                    variant="outlined"
                    size="small"
                    label="CPU"
                    sx={{flex: "0 0 auto"}}
                />
                <Box sx={{minWidth: 0}}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: {xs: "0.92rem", sm: "1rem"},
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                        }}
                    >
                        {dispCpuInfo(serverInfo.basic_info)}
                    </Typography>
                </Box>
            </Stack>
        </div>
    )
}
