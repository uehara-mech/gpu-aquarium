import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import GpuTooltip from './gpuToolTip';


export default function GpuProcessTable(props) {
    
    const data = props.processes;

    return (
        <div>
            <Table aria-labelledby="tableTitle" size="small">
                <TableBody>
                    {data.map((n, index) => {
                        return (
                            <TableRow
                                hover
                                tabIndex={-1}
                                key={index}
                            >
                                <TableCell component="th" scope="row">
                                    {n.process_id}
                                </TableCell>
                                <TableCell>{n.user}</TableCell>
                                <TableCell>
                                    <GpuTooltip
                                        pName={n.process_type} topName={n.process_name }
                                    />
                                </TableCell>
                                <TableCell>{n.gpu_memory}</TableCell>
                                <TableCell>{n.start_time}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}