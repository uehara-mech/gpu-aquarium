import React, { useState } from 'react';


import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import {styled} from "@mui/material/styles";
import SettingsIcon from '@mui/icons-material/Settings';
import FilterSettingContent from "./filterSetting";
import DialogActions from "@mui/material/DialogActions";
import {useRecoilState, useResetRecoilState} from "recoil";
import {FilterState, sortDirectionState, sortState, themeState, tmpFilterState} from "../atom/atom";
import Stack from "@mui/material/Stack";
import OtherSettingContent from "./otherSetting";



const SettingButton = styled(Button)(({ theme }) => ({
    // white border and text
    marginLeft: "auto",
    marginRight: "0px",
    padding: "4px 32px 4px 32px",
    fontWeight: "bold",
    borderWidth: "1px",
    borderColor: "#e3f2fd",
    color: "white",
    '&:hover': {
        backgroundColor: theme.palette.info.light,
        borderColor: "#e3f2fd",
        boxShadow: 'none',
        borderWidth: "1px",
    },
    '& > .MuiButton-startIcon': {
        transition: "transform 0.5s",
        transform: "rotate(0deg)",
    },
    '&:hover > .MuiButton-startIcon': {
        transition: "transform 0.5s",
        transform: "rotate(60deg)",
    },
    [theme.breakpoints.down('sm')]: {
        width: "34px",
        height: "34px",
        minWidth: "34px",
        maxWidth: "34px",
        padding: 0,
        fontSize: 0,
        marginRight: 0,
        overflow: "hidden",
        borderColor: "transparent",
        border: "none",
        '& .MuiButton-startIcon': {
            marginRight: 0,
            marginLeft: 0,
        },
        '& .MuiSvgIcon-root': {
            fontSize: "1.25rem",
        },
    },
}));

const SettingWrapper = styled('div')(({ theme }) => ({
    marginRight: "8px",
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
        marginRight: "2px",
    },
}));

const TabButton = styled(({ active, ...otherProps }) => <Button {...otherProps} />)(({ theme, active }) => ({
    width: "200px",
    marginBottom: theme.spacing(1),
    borderWidth: "2px",
    fontWeight: "bold",
    borderColor: theme.palette.settingButton.otherSettingButton.border,
    // 条件に応じたスタイル
    // deactive -> transparent background
    backgroundColor: active ? theme.palette.settingButton.otherSettingButton.active.default : theme.palette.settingButton.otherSettingButton.deactive.default,
    color: active ? theme.palette.settingButton.otherSettingButton.active.text : theme.palette.settingButton.otherSettingButton.deactive.text,
    // disable hover effect
    '&:hover': {
        backgroundColor: active ? theme.palette.settingButton.otherSettingButton.active.hover : theme.palette.settingButton.otherSettingButton.deactive.hover,
        boxShadow: 'none',
        borderColor: theme.palette.settingButton.otherSettingButton.border,
        borderWidth: "2px",
        borderRightColor: theme.palette.settingButton.otherSettingButton.border + " !important",
    },
    [theme.breakpoints.down('sm')]: {
        width: "50%",
        minWidth: 0,
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    width: "200px",
    borderColor: theme.palette.settingButton.otherSettingButton.border,
    color: theme.palette.settingButton.otherSettingButton.deactive.text,
    borderWidth: "2px",
    fontWeight: "bold",
    '&:hover': {
        borderWidth: "2px",
        borderColor: theme.palette.settingButton.otherSettingButton.border,
        backgroundColor: theme.palette.settingButton.otherSettingButton.deactive.hover,
    },
    [theme.breakpoints.down('sm')]: {
        width: "auto",
        minWidth: "84px",
        paddingLeft: theme.spacing(1.5),
        paddingRight: theme.spacing(1.5),
    }
}));

const DialogTitleWithBorder = styled(DialogTitle)(({ theme }) => ({
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(1),
    borderBottomStyle: "double",
    borderBottomWidth: "4px",
    // borderBottomColor: theme.palette.saveButton,
    "& > *": {
        fontWeight: "bold"
    }
}));


const StyledDialog = styled(Dialog)(({ theme }) => ({
    backdropFilter: "blur(2px)",
    ".MuiDialog-paper": {
        borderWidth: "2px",
        borderColor: theme.palette.paper.border,
        borderStyle: "solid",
        backgroundColor: theme.palette.paper.default,
        padding: theme.spacing(2),
        borderRadius: "0px",
        boxSizing: "border-box",
        [theme.breakpoints.down('sm')]: {
            width: "calc(100% - 32px)",
            maxWidth: "calc(100% - 32px)",
            margin: theme.spacing(2),
            padding: theme.spacing(1.25),
        },
    }
}));



export default function SettingDialog(props) {
    const [tmpFilter, setTmpFilter] = useRecoilState(tmpFilterState);
    const [filterState, setFilterState] = useRecoilState(FilterState)
    const [colorTheme, setColorTheme] = useRecoilState(themeState);
    const [sortOption, setSortOption] = useRecoilState(sortState);
    const [sortDirection, setSortDirection] = useRecoilState(sortDirectionState);

    const resetTmpFilter = useResetRecoilState(tmpFilterState);

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState(0);

    const handleClickOpen = () => {
        setOpen(true);

        try {
            // overwrite tmpFilter with filterState
            setTmpFilter(filterState);
            // overwrite tmp with fixed
            setColorTheme({...colorTheme, "tmp": colorTheme["fixed"]});
            setSortOption({...sortOption, "tmp": sortOption["fixed"]});
            setSortDirection({...sortDirection, "tmp": sortDirection["fixed"]});
        } catch {
            // Keep the dialog usable if persisted settings are malformed.
        }
    }
    const handleClickClose = () => {
        handleCancel();
    }

    const handleCancel = () => {
        // discard all changes in tmpFilter;
        // i.e., overwrite tmpFilter with filterState
        setTmpFilter(filterState);

        // discard all changes in sortOption, sortDirection
        setSortOption({...sortOption, "tmp": sortOption["fixed"]});
        setSortDirection({...sortDirection, "tmp": sortDirection["fixed"]});

        // about colorTheme, we save tmp to fixed
        let newColorTheme = {...colorTheme, "fixed": colorTheme["tmp"]};
        setColorTheme(newColorTheme);
        localStorage.setItem("colorTheme", JSON.stringify(newColorTheme));

        setOpen(false);
    }

    const handleReset = () => {
        // clear all values in tmpFilter
        resetTmpFilter();
    }

    const handleSave = () => {
        // overwrite filterState with tmpFilter
        setFilterState(tmpFilter);

        // overwrite colorTheme, sortOption, sortDirection with tmp
        let newColorTheme = {...colorTheme, "fixed": colorTheme["tmp"]};
        let newSortOption = {...sortOption, "fixed": sortOption["tmp"]};
        let newSortDirection = {...sortDirection, "fixed": sortDirection["tmp"]};

        setColorTheme(newColorTheme);
        setSortOption(newSortOption);
        setSortDirection(newSortDirection);

        // save all changes in settings to localStorage
        localStorage.setItem("filter", JSON.stringify(tmpFilter));
        localStorage.setItem("colorTheme", JSON.stringify(newColorTheme));
        localStorage.setItem("sortOption", JSON.stringify(newSortOption));
        localStorage.setItem("sortDirection", JSON.stringify(newSortDirection));
        setOpen(false);
    }

    return (
        <SettingWrapper>
            <SettingButton
                variant="outlined"
                onClick={handleClickOpen}
                startIcon={<SettingsIcon />}
            >
                Settings
            </SettingButton>
            <StyledDialog
                open={open}
                onClose={handleClickClose}
                scroll="paper"
                maxWidth={"lg"}
                fullWidth
                aria-labelledby="setting-dialog-title"
                aria-describedby="setting-dialog-description"
            >
                <DialogTitleWithBorder id="setting-dialog-title" sx={{px: {xs: 0, sm: 3}}}>
                    <ButtonGroup aria-label="outlined primary button group" fullWidth>
                        <TabButton
                            size="small"
                            active={tab === 0}
                            onClick={() => setTab(0)}
                        >
                            Filter
                        </TabButton>
                        <TabButton
                            size="small"
                            active={tab === 1}
                            onClick={() => setTab(1)}
                        >
                            Other
                        </TabButton>
                    </ButtonGroup>
                </DialogTitleWithBorder>

                {/* if tab === 0, display filter setting */}
                {/* if tab === 1, display other setting */}
                {tab === 0 ? <FilterSettingContent /> : <OtherSettingContent />}

                <DialogActions sx={{justifyContent: "center", px: {xs: 0, sm: 3}}}>
                <Stack direction={"row"} spacing={{xs: 1, sm: 2}} sx={{flexWrap: "wrap", justifyContent: "center", rowGap: 1}}>
                    <ActionButton onClick={handleCancel} variant="outlined"
                        disableElevation size="small">
                        Cancel
                    </ActionButton>
                    <ActionButton onClick={handleReset} variant="outlined"
                        disableElevation size="small">
                        Reset
                    </ActionButton>
                    <ActionButton onClick={handleSave} variant="outlined"
                        disableElevation size="small">
                        Save
                    </ActionButton>
                </Stack>
            </DialogActions>
            </StyledDialog>
        </SettingWrapper>
    );
}
