import React, { useState } from 'react';

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import List from "@mui/material/List";
import Snackbar from "@mui/material/Snackbar";
import ListItem from "@mui/material/ListItem";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {styled} from "@mui/material/styles";
import {Alert, Box} from "@mui/material";
import {Link} from "react-router-dom";
import {getHistoryLogs} from "../api";

const StyledHeaderPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.paper.default,
    borderStyle: 'solid',
    borderWidth: '6px 0px 6px 0px',
    borderColor: theme.palette.paper.borderHeader,
    marginBottom: "12px",
    borderRadius: "0px",
    [theme.breakpoints.down('sm')]: {
        borderWidth: '3px 0px 3px 0px',
        marginBottom: theme.spacing(1),
    },
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
    [theme.breakpoints.down('sm')]: {
        marginLeft: "0 !important",
        marginRight: "0 !important",
        alignSelf: "center",
        padding: "3px 12px",
        fontSize: "0.75rem",
        minWidth: "auto",
    },
}));

const StyledHistoryDialog = styled(Dialog)(({ theme }) => ({
    backdropFilter: "blur(2px)",
    ".MuiDialog-paper": {
        borderWidth: "1px",
        borderColor: theme.palette.paper.border,
        borderStyle: "solid",
        backgroundColor: theme.palette.paper.default,
        padding: theme.spacing(1.5),
        borderRadius: "0px",
        [theme.breakpoints.down('sm')]: {
            width: "calc(100% - 32px)",
            margin: theme.spacing(2),
        },
    }
}));


const GpuIcon = styled('div')(({ theme }) => ({
    margin: "1px 1px 1px 1px",
    height: "10px",
    width: "10px",
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

const MetaItem = ({ label, value }) => (
    <Box sx={{minWidth: 0}}>
        <Typography
            variant="caption"
            sx={{display: "block", color: "text.secondary", lineHeight: 1.15, textTransform: "uppercase"}}
        >
            {label}
        </Typography>
        <Typography
            variant="body2"
            sx={{wordBreak: "break-word", lineHeight: 1.3}}
        >
            {value}
        </Typography>
    </Box>
);


export default function GpuDetailHeader(props) {
    const osData = props.osData;
    const name = props.name;
    const time = props.time;
    const status = props.status;
    let cuda = props.cuda;

    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);

    if (cuda === null || cuda === undefined || cuda.length === 0) {
        cuda = "N/A";
    } else {
        cuda = cuda.join(", ");
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
            <Stack direction={"row"} spacing={0} sx={{flexShrink: 0}} alignItems={"center"}>
                {gpuIcons}
            </Stack>
        )
    }

    const handleHistoryClick = async () => {
        try {
            const response = await getHistoryLogs(name);
            setHistoryLogs(response.data);
            setHistoryDialogOpen(true);
        } catch (error) {
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
        <div style={{display: "flex", justifyContent: "center", width: "100%"}}>
            <StyledHeaderPaper elevation={0} sx={{padding: {xs: "14px 16px", sm: "12px 18px"}, marginTop: {xs: "12px", sm: "20px"}, width: {xs: "100%", sm: "88%", lg: "1120px"}}}>
                <Box sx={{display: {xs: "block", sm: "none"}}}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{gap: 1, mb: 0.5}}>
                        <Typography variant="h5" sx={{fontFamily: 'Titillium Web', fontWeight: "600", fontSize: "1.55rem"}}>
                            {name}
                        </Typography>
                        <HistoryButton
                            variant="outlined"
                            onClick={handleHistoryClick}
                            startIcon={<HistoryIcon />}
                        >
                            History
                        </HistoryButton>
                    </Stack>
                    <Accordion
                        elevation={0}
                        disableGutters
                        sx={{
                            backgroundColor: "transparent",
                            color: "inherit",
                            border: "none",
                            '&:before': {display: "none"},
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{color: "inherit"}} />}
                            sx={{
                                minHeight: 34,
                                px: 0,
                                '& .MuiAccordionSummary-content': {my: 0.5},
                            }}
                        >
                            <Typography variant="button" sx={{color: "text.secondary", fontWeight: 700}}>
                                Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{px: 0, pt: 0, pb: 0.5}}>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 1,
                                    alignItems: "start",
                                    minWidth: 0,
                                }}
                            >
                                <Box sx={{gridColumn: "1 / -1", display: "flex", gap: 1, alignItems: "flex-start", minWidth: 0}}>
                                    {status === "warning" ? <WarningRoundedIcon fontSize="small" sx={{mt: 1.8, flexShrink: 0}}/> : null}
                                    <MetaItem label="OS" value={`${osData.os} ${osData.uname}`} />
                                </Box>
                                <MetaItem label="Time" value={time} />
                                <MetaItem label="Driver" value={props.nvidia_driver_ver} />
                                <MetaItem label="CUDA" value={cuda} />
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
                <Stack direction={{xs: "column", sm: "row"}} spacing={{xs: 1.5, sm: 2}} alignItems={{xs: "stretch", sm: "center"}} sx={{ display: {xs: "none", sm: "flex"}, justifyContent: "space-between" }}>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={{xs: 1.5, sm: 2}} alignItems={{xs: "stretch", sm: "center"}} justifyContent={"flex-start"} sx={{minWidth: 0, flexGrow: 1}}>
                        <Paper
                            elevation={0}
                            sx={{padding: {xs: 0, sm: "4px 16px"}, borderWidth: "3px", margin: {xs: 0, sm: "8px"}, height: {xs: "auto", sm: "3rem"},
                                display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: "rgba(0, 0, 0, 0.0)"}}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{width: "100%", gap: 1}}>
                                <Typography variant="h5" sx={{fontFamily: 'Titillium Web', fontWeight: "600", fontSize: {xs: "1.55rem", sm: "1.5rem"}}}>
                                    {name}
                                </Typography>
                            </Stack>
                        </Paper>
                        <Stack direction={"column"} spacing={{xs: 1, sm: 1}} sx={{minWidth: 0, flexGrow: 1}}>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {xs: "1fr 1fr", sm: "minmax(220px, 1.5fr) minmax(150px, 1fr) minmax(150px, 1fr)"},
                                    gap: {xs: 1, sm: 2},
                                    alignItems: "start",
                                    minWidth: 0,
                                }}
                            >
                                <Box sx={{gridColumn: {xs: "1 / -1", sm: "auto"}, display: "flex", gap: 1, alignItems: "flex-start", minWidth: 0}}>
                                    {status === "warning" ? <WarningRoundedIcon fontSize="small" sx={{mt: 1.8, flexShrink: 0}}/> : null}
                                    <MetaItem label="OS" value={`${osData.os} ${osData.uname}`} />
                                </Box>
                                <MetaItem label="Time" value={time} />
                                <MetaItem label="Driver" value={props.nvidia_driver_ver} />
                                <MetaItem label="CUDA" value={cuda} />
                            </Box>
                        </Stack>
                    </Stack>
                    <HistoryButton
                        variant="outlined"
                        onClick={handleHistoryClick}
                        startIcon={<HistoryIcon />}
                        sx={{ marginLeft: "auto", display: {xs: "none", sm: "inline-flex"} }}
                    >
                        History
                    </HistoryButton>
                </Stack>
            </StyledHeaderPaper>

            <StyledHistoryDialog open={historyDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{px: {xs: 1, sm: 2}, py: 1.5}}>History Logs</DialogTitle>
                <DialogContent sx={{height: "50vh", px: {xs: 1, sm: 2}, pb: 1}}>
                    <List disablePadding>
                        <ListItem disablePadding sx={{mb: 0.75}}>
                            <Link
                                to={"/" + name}
                                style={{
                                    width: "100%",
                                    color: "inherit",       // 現在のテキスト色を使用
                                    textDecoration: "none",
                                    "&:visited": { color: "inherit" }, // 訪問後も同じ色を維持
                                }}
                                onClick={handleLinkClick}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        px: 1.25,
                                        py: 0.9,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        backgroundColor: "rgba(121, 170, 255, 0.08)",
                                    }}
                                >
                                    <Typography variant="body2" sx={{fontWeight: 700}}>
                                        Latest
                                    </Typography>
                                    <Typography variant="caption" sx={{color: "text.secondary"}}>
                                        current
                                    </Typography>
                                </Box>
                            </Link>
                        </ListItem>
                        {historyLogs.map((log, index) => (
                            <ListItem disablePadding sx={{mb: 0.75}} key={index}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(0, 1fr) auto",
                                        alignItems: "center",
                                        gap: 1,
                                        width: "100%",
                                        px: 1.25,
                                        py: 0.9,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        backgroundColor: index % 2 === 0 ? "rgba(255, 255, 255, 0.025)" : "rgba(121, 170, 255, 0.035)",
                                    }}
                                >
                                    <Link
                                        to={"/" + name + "?timestamp=" + log[0]}
                                        style={{
                                            color: "inherit",       // 現在のテキスト色を使用
                                            minWidth: 0,
                                            "&:visited": { color: "inherit" }, // 訪問後も同じ色を維持
                                        }}
                                        onClick={handleLinkClick}
                                    >
                                        <Typography variant="body2" sx={{fontVariantNumeric: "tabular-nums", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                            {log[0]}
                                        </Typography>
                                    </Link>
                                    {gpuIconList(log[1])}
                                </Box>
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
