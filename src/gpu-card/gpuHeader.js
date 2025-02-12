import React from 'react';

import Chip from '@mui/material/Chip';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Grid';
import Button from "@mui/material/Button";
import {grey} from "@mui/material/colors";

const RootStack = styled(Stack)(({ theme }) => ({
    padding: "8px 0px 8px 20px",
}));

const HostName = styled('div')(({ theme }) => ({
    // width is 10 characters length
    width: 100
}));

const InfoIcon = styled('div')(({ theme }) => ({
    // place icon inside this div to the right
    marginLeft: "auto !important",
    marginRight: "15px !important",
    zIndex: 1,
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
}));

const CudaLabel = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.chipTitleBackground,
    fontWeight: '500',
    borderRadius: '14px 0 0 14px',
  padding: '0px 4px 0px 8px',
  lineHeight: '22px',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.chipBackground,
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
        <RootStack direction={"row"} spacing={1} alignItems={"center"}>
            <HostName>
                <Typography variant="h5" sx={{fontFamily: 'Titillium Web', fontWeight: "600"}}>
                {/*<Typography variant={"h6"}>*/}
                    {props.data.basic_info.host_name}
                </Typography>
            </HostName>

            <Grid container spacing={1} alignItems="flex-start" sx={{ flexWrap: 'wrap' }}>
                <Grid item>
                    <StyledChip
                        variant="outlined"
                        size="small"
                        label={props.data.basic_info.gpu_name === 'unknown' ? 'ERROR' : props.data.basic_info.gpu_name}
                    />
                </Grid>
                <Grid item>
                    <CudaChip cudaVersions={props.data.basic_info.cuda_versions} />
                </Grid>
                <Grid item sx={{ flexBasis: '100%', height: 0, padding: "0 !important" }} /> {/* ここで強制的に折り返し */}
                <Grid item>
                    <DisabledChip
                        variant="outlined"
                        size="small"
                        label="singularity"
                        deleteIcon={IsExistIcon(props.data.basic_info.is_singularity_available)}
                        onDelete={() => {}}  // disable delete
                    />
                </Grid>
                <Grid item>
                    <DisabledChip
                        variant="outlined"
                        size="small"
                        label="Docker"
                        deleteIcon={IsExistIcon(props.data.basic_info.is_docker_available)}
                        onDelete={() => {}}  // disable delete
                    />
                </Grid>
            </Grid>

            <InfoIcon>
                <DetailButton
                    variant="outlined"
                    size="small"
                    startIcon={dispInfoIcon(props.data.basic_info.status)}
                    href={'/' + props.data.basic_info.host_name}
                    status={props.data.basic_info.status}
                    >
                    DETAIL
                </DetailButton>
            </InfoIcon>
        </RootStack>
    )
}