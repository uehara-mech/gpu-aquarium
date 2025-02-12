import React, { useState } from 'react';
import axios from 'axios';

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import Snackbar from "@mui/material/Snackbar";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import HistoryIcon from '@mui/icons-material/History';
import {styled} from "@mui/material/styles";
import {Alert} from "@mui/material";
import {Link} from "react-router-dom";

const StyledHeaderPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.paper.default,
    borderStyle: 'solid',
    borderWidth: '6px 0px 6px 0px',
    borderColor: theme.palette.paper.borderHeader,
    marginBottom: "12px",
    borderRadius: "0px",
}));

const HistoryButton = styled(Button)(({ theme }) => ({
    marginLeft: "auto",
    marginRight: "36px !important",
    padding: "4px 32px 4px 32px",
    fontWeight: "bold",
    fontSize: "0.8rem",
    borderWidth: "0.5px",
    borderColor: theme.palette.historyButton.border,
    backgroundColor: theme.palette.historyButton.default,
    color: theme.palette.historyButton.text,
    '&:hover': {
        backgroundColor: theme.palette.historyButton.hover,
        borderColor: theme.palette.historyButton.border,
        boxShadow: 'none',
    },
}));

const StyledHistoryDialog = styled(Dialog)(({ theme }) => ({
    backdropFilter: "blur(2px)",
    ".MuiDialog-paper": {
        borderWidth: "1px",
        borderColor: theme.palette.paper.border,
        borderStyle: "solid",
        backgroundColor: theme.palette.paper.default,
        padding: theme.spacing(2),
        borderRadius: "0px",
    }
}));


const GpuIcon = styled('div')(({ theme }) => ({
    margin: "1px 1px 1px 1px",
    height: "12px",
    width: "12px",
    borderRadius: "15%",
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


export default function GpuDetailHeader(props) {
    const osData = props.osData;
    const name = props.name;
    const time = props.time;
    const status = props.status;
    const timestamp = props.timestamp;
    let cuda = props.cuda;

    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);

    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || '';

    if (cuda === null || cuda === undefined || cuda.length === 0) {
        cuda = "N/A";
    } else {
        cuda = cuda.join(", ");
    }

    const AlertOutDated = () => {
        // timestamp is not null, show alert
        if (timestamp !== null) {
            return (
                <Alert
                    severity="warning"
                    sx={{
                        marginTop: "20px !important",
                        marginBottom: "10px !important",
                        border: "1px solid #fca70a",
                        width: "75%",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        marginLeft: "auto !important",
                        marginRight: "auto !important",
                    }}
                >
                    This data is outdated. The latest data is{" "}
                    <Link
                        to={"/" + name}
                        style={{
                            color: "inherit",       // 現在のテキスト色を使用
                            "&:visited": { color: "inherit" }, // 訪問後も同じ色を維持
                        }}
                    >
                        here
                    </Link>
                </Alert>
            );
        }
    }

    const handleLinkClick = () => {
        setHistoryDialogOpen(false);
    };

    const getGpuIcon = (status, key) => {
        // status: "A" (available), "U" (used), "F" (free)
        if (status === "F") {
            return <FreeGpuIcon key={key} />
        } else if (status === "U") {
            return <UsedGpuIcon key={key} />
        } else if (status === "A") {
            return <AlertGpuIcon key={key} />
        } else {
            return <div key={key} />
        }
    }

    const gpuIconList = (gpuStatusList) => {
        let gpuIcons = [];
        for (let i in gpuStatusList) {
            gpuIcons.push(getGpuIcon(gpuStatusList[i], i));
        }
        return (
            <Stack direction={"row"} spacing={0} sx={{marginLeft: "20px"}} alignItems={"center"}>
                {gpuIcons}
            </Stack>
        )
    }

    const handleHistoryClick = async () => {
        try {
            let url = `${apiBaseUrl}/history/?n=${name}`;
            const response = await axios.get(url);
            setHistoryLogs(response.data);
            setHistoryDialogOpen(true);
        } catch (error) {
            console.error("Failed to fetch history logs", error);
            if (error.response && error.response.status === 404) {
                setErrorSnackbarOpen(true);
            }
        }
    };

    const handleDialogClose = () => {
        setHistoryDialogOpen(false);
    };
    const handleSnackbarClose = () => {
        setErrorSnackbarOpen(false);
    };

    return (
        <div style={{display: "flex", justifyContent: "center", width: "80%"}}>
            <StyledHeaderPaper elevation={0} sx={{padding: "8px 16px", marginTop: "20px", width: "100%"}}>
                <Stack direction={"row"} spacing={2} alignItems={"center"} sx={{ justifyContent: "space-between" }}>
                    <Stack direction={"row"} spacing={2} alignItems={"center"} justifyContent={"flex-start"}>
                        <Paper
                            elevation={0}
                            sx={{padding: "4px 16px", borderWidth: "3px", margin: "8px", height: "3rem",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: "rgba(0, 0, 0, 0.0)"}}
                        >
                            <Typography variant="h5" sx={{fontFamily: 'Titillium Web', fontWeight: "600"}}>
                                {name}
                            </Typography>
                        </Paper>
                        <Stack direction={"column"} spacing={1}>
                            <AlertOutDated />
                            <Stack direction={"row"} spacing={4} sx={{flexGrow: 1, justifyContent: "flex-start"}}>
                                <Stack direction={"column"}>
                                    <Typography variant="subtitle1">{osData.os} {osData.uname}</Typography>
                                    <Stack direction={"row"} spacing={status === "warning" ? 1 : 0}>
                                        {status === "warning" ? <WarningRoundedIcon/> : <div />}
                                        <Typography variant="subtitle1">
                                            Time: {time}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <Stack direction={"column"}>
                                    <Typography variant="subtitle1">NVIDIA Driver Version: {props.nvidia_driver_ver}</Typography>
                                    <Typography variant="subtitle1">CUDA Version: {cuda}</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                    <HistoryButton
                        variant="outlined"
                        onClick={handleHistoryClick}
                        startIcon={<HistoryIcon />}
                        sx={{ marginLeft: "auto" }}
                    >
                        History
                    </HistoryButton>
                </Stack>
            </StyledHeaderPaper>

            <StyledHistoryDialog open={historyDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>History Logs</DialogTitle>
                <DialogContent sx={{height: "50vh"}}>
                    <List>
                        <ListItem sx={{ marginBottom: "4px", paddingTop: "0px", paddingBottom: "0px" }}>
                            <Link
                                to={"/" + name}
                                style={{
                                    color: "inherit",       // 現在のテキスト色を使用
                                    "&:visited": { color: "inherit" }, // 訪問後も同じ色を維持
                                }}
                                onClick={handleLinkClick}
                            >
                                <ListItemText primary="Latest" />
                            </Link>
                        </ListItem>
                        {historyLogs.map((log, index) => (
                            <ListItem sx={{ marginBottom: "4px", paddingTop: "0px", paddingBottom: "0px" }} key={index}>
                                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                    <Link
                                        to={"/" + name + "?timestamp=" + log[0]}
                                        style={{
                                            color: "inherit",       // 現在のテキスト色を使用
                                            "&:visited": { color: "inherit" }, // 訪問後も同じ色を維持
                                        }}
                                        onClick={handleLinkClick}
                                    >
                                        <ListItemText primary={log[0]} />
                                    </Link>
                                    <div>{gpuIconList(log[1])}</div>
                                </Stack>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </StyledHistoryDialog>
            <Snackbar
                open={errorSnackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="error" sx={{ width: '100%' }}
                    variant={"filled"}
                >
                    Failed to fetch history logs. Please try again later.
                </Alert>
            </Snackbar>
        </div>
    );
}
