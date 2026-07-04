import React from 'react';

import Chip from '@mui/material/Chip';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Button from "@mui/material/Button";
import {Link} from "react-router-dom";

const RootStack = styled(Stack)(({ theme }) => ({
    padding: "8px 14px 8px 20px",
    width: "100%",
    boxSizing: "border-box",
    minWidth: 0,
    [theme.breakpoints.up('lg')]: {
        paddingLeft: "12px",
        paddingRight: "10px",
        minHeight: "74px",
    },
    [theme.breakpoints.down('sm')]: {
        padding: "10px 12px 8px 12px",
        gap: theme.spacing(0.75),
    },
}));

const HostName = styled('div')(({ theme }) => ({
    width: 'max-content',
    minWidth: 'max-content',
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
        display: "none",
    },
}));

const MobileTitleRow = styled('div')(({ theme }) => ({
    display: "none",
    [theme.breakpoints.down('sm')]: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing(1),
        width: "100%",
        minWidth: 0,
    },
}));

const InfoIcon = styled('div')(({ theme }) => ({
    // place icon inside this div to the right
    marginLeft: "auto !important",
    marginRight: "0px !important",
    zIndex: 1,
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
        display: "none",
    },
}));

const MobileInfoIcon = styled('div')(({ theme }) => ({
    display: "none",
    [theme.breakpoints.down('sm')]: {
        display: "none",
    },
}));

const DetailButton = styled(({ status, ...other }) => <Button {...other} />)(({ theme, status }) => ({
    color: theme.palette.getContrastText(theme.palette.paper.default),
    borderColor: theme.palette.detailButton.default.operational,
    borderWidth: '1.5px',
    '&:hover': {
        backgroundColor: theme.palette.button.hover,
        borderColor: theme.palette.detailButton.hover.operational,
        boxShadow: 'none',
        borderWidth: '1px',
    },
    '& .MuiSvgIcon-root': {
        color: status === 'error'
            ? theme.palette.detailButton.default.error
            : status === 'warning'
            ? theme.palette.detailButton.default.warning
            : theme.palette.detailButton.default.operational,
    },
    [theme.breakpoints.down('sm')]: {
        minWidth: "auto",
        padding: "3px 10px",
        fontSize: "0.78rem",
        lineHeight: 1.35,
    },
    [theme.breakpoints.up('sm')]: {
        minWidth: 102,
        paddingLeft: 10,
        paddingRight: 10,
    },
}));


const CudaChipDiv = styled('div')(({ theme }) => ({
    borderRadius: '16px',
    border: '1px solid',
    borderColor: theme.palette.chipBorder,
    backgroundColor: theme.palette.chipBackground,
    padding: 0,
    verticalAlign: 'middle',
    display: 'inline-flex',
    margin: '0px 2px 0px 2px',
    width: 'fit-content',
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8125rem',
    height: '24px',
    [theme.breakpoints.up('sm')]: {
        height: '22px',
    },
}));

const CudaLabel = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.chipTitleBackground,
    fontWeight: '500',
    borderRadius: '14px 0 0 14px',
  padding: '0px 4px 0px 8px',
  lineHeight: '22px',
  [theme.breakpoints.up('sm')]: {
    padding: '0px 3px 0px 7px',
    lineHeight: '20px',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.chipBackground,
    [theme.breakpoints.up('sm')]: {
        height: 22,
        '& .MuiChip-label': {
            paddingLeft: 8,
            paddingRight: 8,
        },
    },
}));

const DisabledChip = styled(StyledChip)(({ theme }) => ({
    // disable deleteIcon's pointer events
    '& .MuiChip-deleteIcon': {
        pointerEvents: 'none',
        // use default text color
        color: 'inherit'
    }
}));

const CudaChip = (cudaVersions) => {
    // cudaVersions: Array(n)
    // put <Divider /> between each element
    return (
        <CudaChipDiv>
            <Stack direction={'row'} spacing={0} alignItems={'center'} sx={{ paddingRight: '4px' }}>
                <CudaLabel>CUDA</CudaLabel>
                {/*<Divider orientation="vertical" flexItem />*/}
                {cudaVersions.cudaVersions.map((cudaVersion, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Typography variant="body2" sx={{paddingLeft: '4px', paddingRight: '4px'}}>{cudaVersion}</Typography>
                            {index !== cudaVersions.cudaVersions.length - 1 && <Divider orientation="vertical" flexItem />}
                        </React.Fragment>
                    )
                })}
            </Stack>
        </CudaChipDiv>
    )
}

export default function GpuHeader(props) {
    const dispInfoIcon = (status) => {
        if (status === "error") {
            return <DangerousOutlinedIcon />
        } else if(status === "warning") {
            return <ReportProblemOutlinedIcon />
        } else {
            return <InfoOutlinedIcon />
        }
    }

    const IsExistIcon = (isExist) => {
        if (isExist) {
            return <CheckIcon />
        } else {
            return <CloseIcon />
        }
    }

    return (
        <RootStack direction={{xs: "column", sm: "row"}} spacing={{xs: 1, sm: 1.75}} alignItems={{xs: "stretch", sm: "center"}}>
            <MobileTitleRow>
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: 'Titillium Web',
                        fontWeight: "600",
                        fontSize: "1.35rem",
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {props.data.basic_info.host_name}
                </Typography>
                <DetailButton
                    component={Link}
                    variant="outlined"
                    size="small"
                    startIcon={dispInfoIcon(props.data.basic_info.status)}
                    to={'/' + props.data.basic_info.host_name}
                    status={props.data.basic_info.status}
                    sx={{whiteSpace: "nowrap", flexShrink: 0}}
                >
                    DETAIL
                </DetailButton>
            </MobileTitleRow>
            <HostName>
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: 'Titillium Web',
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                    }}
                >
                {/*<Typography variant={"h6"}>*/}
                    {props.data.basic_info.host_name}
                </Typography>
            </HostName>

            <Box
                sx={{
                    display: {xs: "flex", sm: "none"},
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 0.75,
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    overflowX: "hidden",
                    overflowY: "hidden",
                    pb: 0.25,
                }}
            >
                <Box sx={{flex: "0 0 auto"}}>
                    <StyledChip
                        variant="outlined"
                        size="small"
                        label={props.data.basic_info.gpu_name === 'unknown' ? 'ERROR' : props.data.basic_info.gpu_name}
                    />
                </Box>
                <Box sx={{flex: "0 0 auto"}}>
                    <CudaChip cudaVersions={props.data.basic_info.cuda_versions} />
                </Box>
                <Box sx={{flex: "0 0 auto"}}>
                    <DisabledChip
                        variant="outlined"
                        size="small"
                        label="singularity"
                        deleteIcon={IsExistIcon(props.data.basic_info.is_singularity_available)}
                        onDelete={() => {}}  // disable delete
                    />
                </Box>
                <Box sx={{flex: "0 0 auto"}}>
                    <DisabledChip
                        variant="outlined"
                        size="small"
                        label="Docker"
                        deleteIcon={IsExistIcon(props.data.basic_info.is_docker_available)}
                        onDelete={() => {}}  // disable delete
                    />
                </Box>
            </Box>
            <Box
                sx={{
                    display: {xs: "none", sm: "flex"},
                    flexDirection: "column",
                    gap: 0.65,
                    minWidth: "max-content",
                    flex: "0 0 auto",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        minWidth: "max-content",
                        flexWrap: "nowrap",
                    }}
                >
                    <StyledChip
                        variant="outlined"
                        size="small"
                        label={props.data.basic_info.gpu_name === 'unknown' ? 'ERROR' : props.data.basic_info.gpu_name}
                        sx={{
                            flex: "0 0 auto",
                        }}
                    />
                    <Box sx={{flex: "0 0 auto"}}>
                        <CudaChip cudaVersions={props.data.basic_info.cuda_versions} />
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        minWidth: "max-content",
                        flexWrap: "nowrap",
                    }}
                >
                    <DisabledChip
                        variant="outlined"
                        size="small"
                        label="singularity"
                        deleteIcon={IsExistIcon(props.data.basic_info.is_singularity_available)}
                        onDelete={() => {}}  // disable delete
                    />
                    <DisabledChip
                        variant="outlined"
                        size="small"
                        label="Docker"
                        deleteIcon={IsExistIcon(props.data.basic_info.is_docker_available)}
                        onDelete={() => {}}  // disable delete
                    />
                </Box>
            </Box>

            <InfoIcon>
                <DetailButton
                    component={Link}
                    variant="outlined"
                    size="small"
                    startIcon={dispInfoIcon(props.data.basic_info.status)}
                    to={'/' + props.data.basic_info.host_name}
                    status={props.data.basic_info.status}
                    sx={{whiteSpace: "nowrap"}}
                    >
                    DETAIL
                </DetailButton>
            </InfoIcon>
            <MobileInfoIcon>
                <DetailButton
                    component={Link}
                    variant="outlined"
                    size="small"
                    startIcon={dispInfoIcon(props.data.basic_info.status)}
                    to={'/' + props.data.basic_info.host_name}
                    status={props.data.basic_info.status}
                    sx={{whiteSpace: "nowrap", minWidth: 116}}
                >
                    DETAIL
                </DetailButton>
            </MobileInfoIcon>
        </RootStack>
    )
}
