import React, {useEffect, useState} from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';

import {HashRouter, Routes, Route, Link} from "react-router-dom";
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';

import CardContainer from './gpu-card/cardContainer';
import {RecoilRoot, useRecoilState, useRecoilValue} from "recoil";
import {gpuState, themeState, showHiddenNodeState} from "./atom/atom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import GpuDetail from "./gpu-details/gpuDetail";
import SettingDialog from "./settings/settingDialog";
import {getDesignTokens} from "./theme";
import {LoadingCircle} from "./utils/utils";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useData, DataProvider } from './context'
import DownloadButton from "./downloadButton";
import {getMergedData} from "./api";

function App() {
    return (
        <RecoilRoot>
            <Root />
        </RecoilRoot>
    )
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.info.main,
    borderBottomColor: theme.palette.paper.border,
    borderBottomWidth: theme.palette.type === "dark" ? "1px" : "0px",
    borderBottomStyle: "solid",
    width: "100vw",
    maxWidth: "100vw",
    overflow: "hidden",
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: 'white',
    minWidth: 0,
    flexShrink: 1,
    [theme.breakpoints.down('sm')]: {
        maxWidth: 'calc(100% - 80px)',
    },
    '&:hover': {
        textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
        transition: 'text-shadow 0.5s ease-in-out',
    },
    '&:not(:hover)': {
        transition: 'text-shadow 0.5s ease-in-out',
    },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontFamily: 'Titillium Web',
    fontSize: '2.5rem',
    fontWeight: 600,
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.55rem',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}));

const HeaderToolbar = ({hidden = false, appTitle, toolbarSx}) => (
    <Toolbar
        variant="dense"
        aria-hidden={hidden}
        sx={{
            ...toolbarSx,
            visibility: hidden ? "hidden" : "visible",
            pointerEvents: hidden ? "none" : "auto",
        }}
    >
        <Grid container justifyContent={"center"} alignItems={"center"} sx={{width: "100%", maxWidth: "100%", minWidth: 0}}>
            <Grid item xs={12} md={10} sx={{minWidth: 0, maxWidth: "100%"}}>
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{width: "100%", maxWidth: "100%", minWidth: 0, gap: {xs: 0.5, sm: 1}, position: "relative"}}
                >
                    {hidden ? (
                        <Box sx={{minWidth: 0, flexShrink: 1, maxWidth: {xs: 'calc(100% - 80px)', sm: "none"}}}>
                            <StyledTypography>
                                {appTitle}
                            </StyledTypography>
                        </Box>
                    ) : (
                        <StyledLink to={"/"}>
                            <StyledTypography>
                                {appTitle}
                            </StyledTypography>
                        </StyledLink>
                    )}
                    <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                            ml: "auto",
                            flexShrink: 0,
                            position: "static",
                        }}
                    >
                        {hidden ? (
                            <>
                                <Box sx={{width: {xs: 34, sm: 156}, height: {xs: 34, sm: 32}, mr: {xs: "2px", sm: "8px"}, flexShrink: 0}} />
                                <Box sx={{width: {xs: 34, sm: 40}, height: {xs: 34, sm: 32}, flexShrink: 0}} />
                            </>
                        ) : (
                            <>
                                <SettingDialog/>
                                <DownloadButton/>
                            </>
                        )}
                    </Stack>
                </Stack>
            </Grid>
        </Grid>
    </Toolbar>
);

function Root() {
    const [serverInfo, setserverInfo] = useRecoilState(gpuState);
    const themeValue = useRecoilValue(themeState)['tmp'];
    const showHiddenNode = useRecoilValue(showHiddenNodeState)['tmp'];
    const [isLoading, setIsLoading] = useState(false);

    const appTitle = process.env.REACT_APP_TITLE || 'AQUARIUM';

    const theme = createTheme(getDesignTokens(themeValue));
    const toolbarSx = {
        px: {xs: 2, sm: 2},
        width: "100vw",
        maxWidth: "100vw",
        boxSizing: "border-box",
    };

    useEffect(() => {
        document.body.style.backgroundColor = theme.palette.background.default;
    }, [theme.palette.background.default]);

    function isPlainObject(data) {
        return Object.prototype.toString.call(data) === '[object Object]';
    }

    useEffect(() => {
        const fetchData = async () => {
            await getMergedData()
                .then((res) => {
                    if (isPlainObject(res.data)) {
                        // Filter servers based on visibility
                        // res.data: {server1: {basic_info: {...}, gpu_info: [{...}, ...]}, server2: {...}, ...}
                        let filteredData = {};
                        for (let server in res.data) {
                            if (res.data[server].basic_info.visibility !== 'hidden' || showHiddenNode) {
                                filteredData[server] = res.data[server];
                            }
                        }
                        setserverInfo(filteredData);
                    } else {
                        setserverInfo([]);
                    }
                }).catch(() => {
                    setserverInfo([]);
                });
        };
        fetchData();

        const timer = setTimeout(() => {
            setIsLoading(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [showHiddenNode, setserverInfo]);

    const CardContainerWrapper = () => {
        const { setState } = useData();
        useEffect(() => {
            setState({
                cardContainerData: serverInfo,
                gpuDetails: null
            });
        }, [setState]);

        if (serverInfo === null && isLoading) {
            return (<LoadingCircle />)
        } else if (serverInfo === null) {
            return (<div />)
        } else {
            return (
                <CardContainer />
            )
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <DataProvider>
                <HashRouter>
                    <StyledAppBar position="fixed">
                        <HeaderToolbar appTitle={appTitle} toolbarSx={toolbarSx} />
                    </StyledAppBar>
                    <HeaderToolbar hidden appTitle={appTitle} toolbarSx={toolbarSx} />
                    <Routes>
                        <Route path="/:name" element={<GpuDetail />} />
                        <Route path="/" element={<CardContainerWrapper/>} />
                    </Routes>
                </HashRouter>
            </DataProvider>
        </ThemeProvider>
    );
}

export default App;
