import React from 'react';
import {Download as DownloadIcon} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import {useData} from './context';
import Tooltip from "@mui/material/Tooltip";

const DownloadButton = () => {
    const { state } = useData();

    const handleDownload = () => {
        const data = JSON.stringify(state, null, 2);
        console.log("download data: ", state);
        let dataType = '';
        if (state.gpuDetails !== null) {
            dataType = state.gpuDetails.basic_info.host_name;
        } else {
            dataType = 'overview';
        }
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date();
        a.download = `${dataType}-${date.getFullYear()}-${date.getMonth() + 1}${date.getDate()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Tooltip title="Download as JSON">
            <IconButton onClick={handleDownload}>
                <DownloadIcon
                    sx={{color: 'white'}}
                />
            </IconButton>
        </Tooltip>
        )
};

export default DownloadButton;
