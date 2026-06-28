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
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: 'white',
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
}));

function Root() {
    const [serverInfo, setserverInfo] = useRecoilState(gpuState);
    const themeValue = useRecoilValue(themeState)['tmp'];
    const showHiddenNode = useRecoilValue(showHiddenNodeState)['tmp'];
    const [isLoading, setIsLoading] = useState(false);

    const appTitle = process.env.REACT_APP_TITLE || 'AQUARIUM';

    const theme = createTheme(getDesignTokens(themeValue));

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
                    console.log(res.data);
                }).catch((err) => {
                    console.log(err);
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

        console.log("loading", isLoading);
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
                    <StyledAppBar position="sticky">
                        <Toolbar variant="dense">
                            <Grid container justifyContent={"center"} alignItems={"center"}>
                                <Grid item xs={10} md={10}>
                                    <Stack direction="row" alignItems="center">
                                        <StyledLink to={"/"}>
                                            <StyledTypography>
                                                {appTitle}
                                            </StyledTypography>
                                        </StyledLink>
                                        <SettingDialog/>
                                        <DownloadButton/>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </StyledAppBar>
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
