import React, { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';

import GpuTooltip from './gpuToolTip';

export default function TopProcessTable(props) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('cpu');

    const data = props.processes;

    const sortedData = [...data].sort((a, b) => {
        const aVal = isNaN(a[orderBy]) ? a[orderBy] : parseFloat(a[orderBy]);
        const bVal = isNaN(b[orderBy]) ? b[orderBy] : parseFloat(b[orderBy]);

        return (aVal < bVal ? -1 : 1) * (order === 'asc' ? 1 : -1);
    });

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

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

    return (
        <div>
            <Table aria-labelledby="tableTitle" size="small" sx={{width: 900}}>
                <TableHead>
                    <TableRow>
                        <TableCell align="right">
                            <TableSortLabel
                                active={orderBy === 'process_id'}
                                direction={orderBy === 'process_id' ? order : 'asc'}
                                onClick={createSortHandler('process_id')}
                            >
                                PID
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                            <TableSortLabel
                                active={orderBy === 'user'}
                                direction={orderBy === 'user' ? order : 'asc'}
                                onClick={createSortHandler('user')}
                            >
                                User
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="left">Process</TableCell>
                        <TableCell align="right">
                            <TableSortLabel
                                active={orderBy === 'cpu'}
                                direction={orderBy === 'cpu' ? order : 'asc'}
                                onClick={createSortHandler('cpu')}
                            >
                                %CPU
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                            <TableSortLabel
                                active={orderBy === 'cpu_memory'}
                                direction={orderBy === 'cpu_memory' ? order : 'asc'}
                                onClick={createSortHandler('cpu_memory')}
                            >
                                %MEM
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">Start</TableCell>
                        <TableCell align="right">Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n, index) => (
                        <TableRow hover tabIndex={-1} key={index}>
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
                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
}
