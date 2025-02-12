import React from 'react';

import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {styled} from "@mui/material/styles";


const ProcessNameToolTip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ tooltip: className }} />
))(({ theme }) => ({
  maxWidth: 400,
  fontSize: "0.9rem",
  fontWeight: "bold",
}));

const ProcessNameButton = styled(Button)(({theme}) => ({
    padding: '0px 5px 0px 5px',
    minHeight: '0px',
    minWidth: '0px',
    textTransform: 'none',
    borderStyle: 'solid',
    borderWidth: '0.5px',
    borderColor: theme.palette.button.border,
    color: theme.palette.getContrastText(theme.palette.paper.default),
    // disable hover effect
    '&:hover': {
        backgroundColor: theme.palette.button.hover,
        borderColor: theme.palette.button.border,
        boxShadow: 'none',
        borderWidth: '0.5px',
    },
}));


const shortenProcess = (topName, shortName = '') => {
    if (topName.indexOf('ipykernel') !== -1 || topName.indexOf('jupyter') !== -1) {
        return 'jupyter';
    } else if (shortName.length > 6) {
        return shortName.substring(0, 5) + '...';
    } else {
        return shortName;
    }
};


export default function GpuTooltip(props) {
    
    const [open, setOpen] = React.useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    const processName = props.pName;
    const topName = props.topName;

    return (
        <div>
            <ClickAwayListener onClickAway={handleTooltipClose}>
                <div>
                <ProcessNameToolTip
                    PopperProps={{
                      disablePortal: true,
                    }}
                    onClose={handleTooltipClose}
                    open={open}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title={topName}
                    // classes={{tooltip: classes.tooltip }}
                    placement="bottom"
                    interactive="true"
                >
                    <ProcessNameButton variant="outlined" onClick={handleTooltipOpen}>
                        {shortenProcess(topName, processName)}
                    </ProcessNameButton>
                </ProcessNameToolTip>
                    </div>
            </ClickAwayListener>
        </div>
    );
}