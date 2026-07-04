import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import GpuTooltip from './gpuToolTip';


export default function GpuProcessTable(props) {
    
    const data = props.processes;

    return (
        <div style={{width: "100%"}}>
            <Box sx={{display: {xs: "block", sm: "none"}, pt: 0.75, px: {xs: 1.25, sm: 0}}}>
                {data.map((n, index) => (
                    <Box
                        key={index}
                        sx={{
                            borderTop: index === 0 ? 0 : "1px solid",
                            borderColor: "divider",
                            py: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box sx={{minWidth: 0}}>
                                <GpuTooltip
                                    pName={n.process_type}
                                    topName={n.process_name}
                                />
                            </Box>
                            <Typography variant="body2" sx={{fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap"}}>
                                {n.gpu_memory || "0 MiB"}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mt: 0.75,
                                minWidth: 0,
                                color: "text.secondary",
                                flexWrap: "wrap",
                            }}
                        >
                            <Typography variant="caption" sx={{lineHeight: 1.2, fontVariantNumeric: "tabular-nums"}}>
                                PID {n.process_id}
                            </Typography>
                            <Typography variant="caption" sx={{lineHeight: 1.2, opacity: 0.45}}>
                                /
                            </Typography>
                            <Typography variant="caption" sx={{lineHeight: 1.2}}>
                                {n.user}
                            </Typography>
                            <Typography variant="caption" sx={{lineHeight: 1.2, opacity: 0.45}}>
                                /
                            </Typography>
                            <Typography variant="caption" sx={{lineHeight: 1.2, fontVariantNumeric: "tabular-nums"}}>
                                start {n.start_time}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
            <Box sx={{display: {xs: "none", sm: "block"}, overflowX: "auto"}}>
            <Table aria-labelledby="tableTitle" size="small" sx={{minWidth: 0}}>
                <TableBody>
                    {data.map((n, index) => {
                        return (
                            <TableRow
                                hover
                                tabIndex={-1}
                                key={index}
                            >
                                <TableCell component="th" scope="row" sx={{px: {xs: 0.75, sm: 2}, py: {xs: 0.5, sm: 0.75}, whiteSpace: "nowrap"}}>
                                    {n.process_id}
                                </TableCell>
                                <TableCell sx={{px: {xs: 0.75, sm: 2}, py: {xs: 0.5, sm: 0.75}, display: {xs: "none", sm: "table-cell"}}}>{n.user}</TableCell>
                                <TableCell sx={{px: {xs: 0.75, sm: 2}, py: {xs: 0.5, sm: 0.75}}}>
                                    <GpuTooltip
                                        pName={n.process_type} topName={n.process_name }
                                    />
                                </TableCell>
                                <TableCell sx={{px: {xs: 0.75, sm: 2}, py: {xs: 0.5, sm: 0.75}, textAlign: "right", whiteSpace: "nowrap"}}>{n.gpu_memory}</TableCell>
                                <TableCell sx={{px: {xs: 0.75, sm: 2}, py: {xs: 0.5, sm: 0.75}, display: {xs: "none", sm: "table-cell"}}}>{n.start_time}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            </Box>
        </div>
    );
}
