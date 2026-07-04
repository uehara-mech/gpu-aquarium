import React from 'react';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import GpuHeader from './gpuHeader';
import GpuContent from './gpuContent';
import {styled} from "@mui/material/styles";
import {useTheme} from "@mui/material";


const CustomLightPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'borderWidth' && prop !== 'borderColor' && prop !== 'borderSize',
})(({ borderWidth = 1, borderSize = 32, theme }) => ({
  position: 'relative',
  margin: '20px',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  background: 'none',
    transition: "background-color 0.5s, box-shadow 0.5s",
    boxShadow: "inset 0 0 4px 0px #c7c7c785, 0 0 5px 0px #c7c7c785",
    backgroundColor: theme.palette.paper.default,
    // border: "1px solid #d7d7d7",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme.palette.paper.border,
    borderRadius: "0px",
  '&::before, &::after, & > span::before, & > span::after': {
    display: 'block',
    color: theme.palette.paper.corner,
    content: '""',
    width: borderSize,
    height: borderSize,
    position: 'absolute',
  },
  '&::before': {
    top: -borderWidth/2,
    left: -borderWidth/2,
    borderStyle: 'solid',
    borderTopWidth: borderWidth,
    borderLeftWidth: borderWidth,
      borderBottomWidth: 0,
        borderRightWidth: 0,
  },
  '&::after': {
    top: -borderWidth/2,
    right: -borderWidth/2,
    borderStyle: 'solid',
    borderTopWidth: borderWidth,
    borderRightWidth: borderWidth,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
  },
  '& > span::before': {
    bottom: -borderWidth/2,
    left: -borderWidth/2,
    borderStyle: 'solid',
    borderBottomWidth: borderWidth,
    borderLeftWidth: borderWidth,
      borderTopWidth: 0,
        borderRightWidth: 0,
  },
  '& > span::after': {
    bottom: -borderWidth/2,
    right: -borderWidth/2,
    borderStyle: 'solid',
    borderBottomWidth: borderWidth,
    borderRightWidth: borderWidth,
        borderTopWidth: 0,
        borderLeftWidth: 0,
  },
    // if hover, lighten the background color
    '&:hover': {
      backgroundColor: theme.palette.paper.light,
      boxShadow: "inset 0 0 4px 0px #c7c7c785, 0 7px 10px 2px #c7c7c785",
    }
}));

const CustomDarkPaper = styled(CustomLightPaper)(({ borderWidth = 1, borderSize = 32, theme }) => ({
  transition: "all 0.3s",
  '&:hover': {
    boxShadow: "inset 0 0 4px 0px #c7c7c785, 0 0 10px 0px #c7c7c785",
    // expand the width and height of the paper with animation
    transition: "all 0.2s ease-in-out 0s",
    transform: "scale(1.01)",
  }
}));

const PaperWithCorner = (props) => {
  const { children, ...rest } = props;
  // change the background color of the paper based on the theme
  const theme = useTheme();

  if (theme.palette.type === "light") {
    return (
      <CustomLightPaper {...rest}>
        {children}
        <span></span>
      </CustomLightPaper>
    );
  } else {
    return (
      <CustomDarkPaper {...rest}>
        {children}
        <span></span>
      </CustomDarkPaper>
    );
  }
};


export default function GpuCard(props) {
    return (
        <Box sx={{width: "100%", maxWidth: {xs: "100%", sm: "600px"}, minWidth: 0, boxSizing: "border-box"}}>
            <PaperWithCorner
                elevation={0}
                sx={{
                    margin: {xs: "8px 0px", sm: "8px"},
                    width: {xs: "100%", sm: "calc(100% - 16px)"},
                    maxWidth: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
                borderWidth={2.75}
                borderSize={40}
            >
          {/*<Paper>*/}

                <GpuHeader data={props.data} />
                <GpuContent data={props.data}/>
            {/*</Paper>*/}
            </PaperWithCorner>
        </Box>
    );
}
