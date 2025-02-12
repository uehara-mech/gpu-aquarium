import React, { useState } from 'react';


import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import {styled} from "@mui/material/styles";
import {blue} from "@mui/material/colors";
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
    borderWidth: "1.5px",
    borderColor: blue[50],
    color: "white",
    '&:hover': {
        backgroundColor: theme.palette.info.light,
        borderColor: blue[50],
        boxShadow: 'none',
    },
    '& > .MuiButton-startIcon': {
        transition: "transform 0.5s",
        transform: "rotate(0deg)",
    },
    '&:hover > .MuiButton-startIcon': {
        transition: "transform 0.5s",
        transform: "rotate(60deg)",
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
        // overwrite tmpFilter with filterState
        setTmpFilter(filterState);
        // overwrite tmp with fixed
        setColorTheme({...colorTheme, "tmp": colorTheme["fixed"]});
        setSortOption({...sortOption, "tmp": sortOption["fixed"]});
        setSortDirection({...sortDirection, "tmp": sortDirection["fixed"]});

        setOpen(true);
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
        <div style={{marginLeft: "auto", marginRight: "8px"}}>
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
                <DialogTitleWithBorder id="setting-dialog-title">
                    <ButtonGroup aria-label="outlined primary button group">
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

                <DialogActions sx={{justifyContent: "center"}}>
                <Stack direction={"row"} spacing={2}>
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
        </div>
    );
}
