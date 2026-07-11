import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import GpuTooltip from './gpuToolTip';

export default function TopProcessTable(props) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('cpu');
    const scrollRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [scrollBar, setScrollBar] = useState({left: 0, width: 100});

    const data = props.processes;

    const sortedData = useMemo(() => [...data].sort((a, b) => {
        const aVal = isNaN(a[orderBy]) ? a[orderBy] : parseFloat(a[orderBy]);
        const bVal = isNaN(b[orderBy]) ? b[orderBy] : parseFloat(b[orderBy]);

        return (aVal < bVal ? -1 : 1) * (order === 'asc' ? 1 : -1);
    }), [data, order, orderBy]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const createSortHandler = (property) => (event) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const updateScrollBar = useCallback(() => {
        if (animationFrameRef.current !== null) {
            return;
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            animationFrameRef.current = null;
            const el = scrollRef.current;
            if (!el) {
                return;
            }

            const maxScroll = el.scrollWidth - el.clientWidth;
            if (maxScroll <= 0) {
                setScrollBar((previous) => previous.left === 0 && previous.width === 100
                    ? previous
                    : {left: 0, width: 100});
                return;
            }

            const width = Math.max(18, (el.clientWidth / el.scrollWidth) * 100);
            const left = (el.scrollLeft / maxScroll) * (100 - width);
            setScrollBar((previous) => previous.left === left && previous.width === width
                ? previous
                : {left, width});
        });
    }, []);

    useEffect(() => {
        updateScrollBar();
        window.addEventListener("resize", updateScrollBar);
        return () => {
            window.removeEventListener("resize", updateScrollBar);
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [updateScrollBar, page, rowsPerPage, data.length]);

    const themed = (theme, light, dark) => theme.palette.type === "light" ? light : dark;
    const mobileHeaderCellSx = (theme) => ({
        borderBottomColor: themed(theme, {xs: "#bccbdd", sm: "divider"}, {xs: "primary.main", sm: "divider"}),
        color: {xs: "text.secondary", sm: "inherit"},
    });

    return (
        <Box
            sx={(theme) => ({
                width: "100%",
                backgroundColor: themed(theme, {xs: "#f6f8fb", sm: "transparent"}, {xs: "rgba(29, 45, 64, 0.72)", sm: "transparent"}),
            })}
        >
            <Box
                sx={(theme) => ({
                    display: {xs: "flex", sm: "none"},
                    alignItems: "center",
                    justifyContent: "flex-start",
                    px: 1.5,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: themed(theme, "#e9f0f8", "rgba(121, 170, 255, 0.14)"),
                })}
            >
                <Typography variant="button" sx={{fontWeight: 700, letterSpacing: 0.4}}>
                    Node Processes
                </Typography>
            </Box>
            <Box
                ref={scrollRef}
                onScroll={updateScrollBar}
                sx={(theme) => ({
                    overflowX: "scroll",
                    backgroundColor: themed(theme, {xs: "#ffffff", sm: "transparent"}, {xs: "rgba(18, 28, 40, 0.64)", sm: "transparent"}),
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    '&::-webkit-scrollbar': {
                        display: "none",
                    },
                })}
            >
            <Table
                aria-labelledby="tableTitle"
                size="small"
                sx={{
                    width: {xs: 720, sm: 900},
                    '& .MuiTableCell-root': {
                        py: {xs: 0.9, sm: 0.75},
                    },
                }}
            >
                <TableHead>
                    <TableRow
                        sx={(theme) => ({
                            backgroundColor: themed(theme, {xs: "#edf3fa", sm: "transparent"}, {xs: "rgba(121, 170, 255, 0.11)", sm: "transparent"}),
                        })}
                    >
                        <TableCell align="right" sx={mobileHeaderCellSx}>
                            <TableSortLabel
                                active={orderBy === 'process_id'}
                                direction={orderBy === 'process_id' ? order : 'asc'}
                                onClick={createSortHandler('process_id')}
                            >
                                PID
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={mobileHeaderCellSx}>
                            <TableSortLabel
                                active={orderBy === 'user'}
                                direction={orderBy === 'user' ? order : 'asc'}
                                onClick={createSortHandler('user')}
                            >
                                User
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="left" sx={mobileHeaderCellSx}>Process</TableCell>
                        <TableCell align="right" sx={mobileHeaderCellSx}>
                            <TableSortLabel
                                active={orderBy === 'cpu'}
                                direction={orderBy === 'cpu' ? order : 'asc'}
                                onClick={createSortHandler('cpu')}
                            >
                                %CPU
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={mobileHeaderCellSx}>
                            <TableSortLabel
                                active={orderBy === 'cpu_memory'}
                                direction={orderBy === 'cpu_memory' ? order : 'asc'}
                                onClick={createSortHandler('cpu_memory')}
                            >
                                %MEM
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={mobileHeaderCellSx}>Start</TableCell>
                        <TableCell align="right" sx={mobileHeaderCellSx}>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {visibleRows.map((n, index) => (
                        <TableRow
                            hover
                            tabIndex={-1}
                            key={index}
                            sx={(theme) => ({
                                backgroundColor: themed(
                                    theme,
                                    {xs: index % 2 === 0 ? "#ffffff" : "#f5f8fc", sm: "transparent"},
                                    {xs: index % 2 === 0 ? "rgba(255, 255, 255, 0.025)" : "rgba(121, 170, 255, 0.035)", sm: "transparent"}
                                ),
                            })}
                        >
                            <TableCell align="right">{n.process_id}</TableCell>
                            <TableCell align="right">{n.user}</TableCell>
                            <TableCell align="left">
                                <GpuTooltip pName={n.process_type} topName={n.process_name} />
                            </TableCell>
                            <TableCell align="right">{parseFloat(n.cpu).toFixed(2)}</TableCell>
                            <TableCell align="right">{parseFloat(n.cpu_memory).toFixed(3)}</TableCell>
                            <TableCell align="right">{n.start_time}</TableCell>
                            <TableCell align="right">{n.status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </Box>
            <Box
                sx={(theme) => ({
                    display: {xs: "block", sm: "none"},
                    height: 8,
                    mx: 1.5,
                    my: 1,
                    borderRadius: 999,
                    backgroundColor: themed(theme, "#d9e3ef", "rgba(121, 170, 255, 0.18)"),
                    position: "relative",
                    overflow: "hidden",
                })}
            >
                <Box
                    sx={(theme) => ({
                        position: "absolute",
                        top: 1,
                        bottom: 1,
                        left: `${scrollBar.left}%`,
                        width: `${scrollBar.width}%`,
                        minWidth: 24,
                        borderRadius: 999,
                        backgroundColor: themed(theme, "#5f85b7", "#8ab8ff"),
                        boxShadow: themed(theme, "0 0 0 1px rgba(55, 84, 120, 0.12)", "0 0 8px rgba(138, 184, 255, 0.45)"),
                    })}
                />
            </Box>
            <TablePagination
                sx={(theme) => ({
                    display: {xs: data.length <= rowsPerPage ? "none" : "block", sm: "block"},
                    borderTop: "1px solid",
                    borderColor: "divider",
                    backgroundColor: themed(theme, {xs: "#f6f8fb", sm: "transparent"}, {xs: "rgba(15, 24, 35, 0.72)", sm: "transparent"}),
                    '& .MuiTablePagination-toolbar': {
                        minHeight: {xs: 42, sm: 52},
                        px: {xs: 1, sm: 2},
                    },
                })}
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
}
