import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


export default function GpuCardTable(props) {

    const serverInfo = props.gpu;

    return (
        <TableContainer component={Paper} elevation={0} sx={{backgroundColor: "transparent"}}>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell align="right">ID</TableCell>
                        <TableCell align="right">Util</TableCell>
                        <TableCell align="right">Memory</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {serverInfo.map((row, idx) => (
                        <TableRow
                            hover 
                            key={idx}
                        >
                            <TableCell align="right">{idx}</TableCell>
                            <TableCell align="right">{row.gpu_util}</TableCell>
                            <TableCell align="right">{parseInt(row.memory_used, 10)} / {parseInt(row.memory_total, 10)} MiB</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}