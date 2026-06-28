import React, {useEffect, useState} from 'react';

import {useParams} from "react-router-dom";
import Grid from '@mui/material/Unstable_Grid2';

import { LineChart } from '@mui/x-charts/LineChart';
import Stack from "@mui/material/Stack";
import {Alert, Box, useTheme,} from "@mui/material";
import {StyledPaper, StyledDivider, StyledBorderChip} from "./common";
import {LoadingCircle} from "../utils/utils";
import Typography from "@mui/material/Typography";
import {getNodeStats} from "../api";


export default function NodeStats(props) {
    const [nodeStats, setNodeStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const timeRangeStr = "days";  // seconds, minutes, hours, days
    const { name } = useParams();

    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            await getNodeStats(name)
                .then((res) => {
                    setNodeStats(res.data);
                    // setNodeInfo(null);
                }).catch((err) => {
                    console.log(err);
                    setNodeStats({"status": "error"});
                })
        };
        fetchData();

        // set isLoading to true after 1 second
        const timer = setTimeout(() => {
            setIsLoading(true);
        }, 1000);

        // clear timeout when component unmounts
        return () => clearTimeout(timer);
    }, [name]);

    console.log(nodeStats);

    const StatsLineChart = (props) => {
        if (nodeStats === null && isLoading) {
            // display loading animation if nodeInfo is null for 1 second
            return (<LoadingCircle />)
        } else if (nodeStats === null) {
            return (<div />)
        } else if ("status" in nodeStats) {
            if (nodeStats["status"] === "error") {
                return (
                    <Box sx={{width: "100%", display: "flex", justifyContent: "center", marginBottom: "64px"}}>
                        <Alert severity="warning" variant={"outlined"}>
                            Failed to load node-to-file server connection data.
                        </Alert>
                    </Box>
                )
            }
        }

        console.log('timeRangeStr', timeRangeStr)

        const valueFormatter = (date) => {
            // timeRangeStr: seconds -> MM:SS format
            // timeRangeStr: minutes -> HH:MM format
            // timeRangeStr: hours, days -> DD-HH format
            if (timeRangeStr === "seconds") {
                return date.toLocaleTimeString(
                    'en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false}
                );
            } else if (timeRangeStr === "minutes") {
                return date.toLocaleTimeString(
                    'en-US', {hour: '2-digit', minute: '2-digit', hour12: false}
                );
            } else if (timeRangeStr === "hours") {
                return date.toLocaleDateString(
                    'en-US', {day: '2-digit', hour: '2-digit', hour12: false}
                );
            } else {
                return date.toLocaleDateString(
                    'en-US', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: 'numeric', hour12: false}
                ).replace(', ', ' ')
            }
        }

        // xaxis: 0, 1, ... (length of nodeStats[0])
        // let xaxis = Array.from({length: nodeStats["timestamp"].length}, (_, i) => i);
        let xaxis = nodeStats["timestamp"];
        // convert unix timestamp to Date object
        xaxis = xaxis.map((dateItem) => new Date(dateItem * 1000));

        let series = nodeStats[props.nodeName];
        // x1000 to convert to milliseconds
        series = series.map((sec) => sec * 1000);

        return (
            <StyledPaper sx={{width: "fit-content"}} elevation={0}>
                <Stack direction={"column"} spacing={1} justifyContent={"center"} alignItems={"center"}>
                    <Typography variant={"h6"} sx={{marginTop: "16px"}}>{props.nodeName}</Typography>
                    <LineChart
                        xAxis={[{
                            data: xaxis, scaleType: 'time',
                            tickMinStep: 30 * 1000, valueFormatter,
                        }]}
                        series={[{curve: "natural", data: series, showMark: false, color: theme.palette.paper.border}]}
                        width={500}
                        height={200}
                        margin={{top: 16, right: 64, bottom: 64, left: 64}}
                        padding={{top: 0, right: 0, bottom: 0, left: 0}}
                        // axisHighlight={{y: 'none'}}
                        sx={{
                            '.MuiLineElement-root': {
                                strokeWidth: 1.5,
                                stroke: theme.palette.paper.border
                            },
                            '.MuiMarkElement-root': {
                                stroke: theme.palette.paper.border,
                                fill: theme.palette.paper.border
                            }
                        }}
                    />
                </Stack>
            </StyledPaper>
        );
    }

    const GroupLineChart = () => {
        if (nodeStats === null && isLoading) {
            // display loading animation if nodeInfo is null for 1 second
            return (<LoadingCircle />)
        } else if (nodeStats === null) {
            return (<div />)
        }

        let nodeNameList = Object.keys(nodeStats);
        // remove keys start with "gpu", "node", "timestamp"
        nodeNameList = nodeNameList.filter((nodeKey) => !nodeKey.startsWith("gpu"));
        nodeNameList = nodeNameList.filter((nodeKey) => !nodeKey.startsWith("node"));
        nodeNameList = nodeNameList.filter((nodeKey) => !nodeKey.startsWith("timestamp"));
        console.log("nodeNameList", nodeNameList);

        let lineCharts = nodeNameList.map((nodeName) => {
            return (
                <Grid key={nodeName} align={"center"}>
                    <StatsLineChart nodeName={nodeName} key={nodeName}/>
                </Grid>
            )
        }
        )

        // if lineCharts.length is even, add a dummy element to the end with same width and height
        if (lineCharts.length % 2 === 1 && lineCharts.length > 1) {
            lineCharts.push(<div key={"dummy"} style={{width: "500px", margin: "8px"}}/>)
        }

        return (
            <Grid container justifyContent={"center"} alignItems={"center"} spacing={2}>
                {lineCharts}
            </Grid>
        )
    }

    return (
        <Stack direction={"column"} spacing={1} alignItems={"center"} justifyContent={"center"}>
            <StyledDivider>
                <StyledBorderChip label={"File Server Communication"} variant={"outlined"} />
                {/*<Typography>File Server Communication</Typography>*/}
            </StyledDivider>
            <GroupLineChart />
        </Stack>
    );

}
