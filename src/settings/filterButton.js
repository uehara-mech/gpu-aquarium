import React from 'react';


import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {useRecoilState} from "recoil";
import {tmpFilterState} from "../atom/atom";
import {styled} from "@mui/material/styles";
import {grey} from "@mui/material/colors";


export const StyledButton = styled(({ active, ...otherProps }) => <Button {...otherProps} />)(({ theme, active }) => ({
    margin: theme.spacing(1),
    width: "80%",
    lineHeight: "1.1rem",
    paddingTop: "6px",
    paddingBottom: "6px",
    backgroundColor: active ? theme.palette.settingButton.active.default : theme.palette.settingButton.deactive.default,
    color: theme.palette.getContrastText(active ? theme.palette.settingButton.active.default : theme.palette.settingButton.deactive.default),
    '&:hover': {
        backgroundColor: active ? theme.palette.settingButton.active.hover : theme.palette.settingButton.deactive.hover,
    },
}));

const SelectAllButton = styled(StyledButton)(({ theme }) => ({
    backgroundColor: theme.palette.settingButton.selectAllButton.default,
    // disable hover effect
    '&:hover': {
        backgroundColor: theme.palette.settingButton.selectAllButton.hover,
        boxShadow: 'none',
    }
}));

export const KeyNameGrid = styled(Grid)(({ theme }) => ({
    backgroundColor: grey[600],
    paddingTop: theme.spacing(0.2),
    paddingBottom: theme.spacing(0.2),
    paddingLeft: theme.spacing(1),
    color: theme.palette.getContrastText(grey[600]),
    margin: "8px 3px 8px 8px",
    fontWeight: "bold",
    fontSize: "0.95rem",
    lineHeight: "1.4rem",
}));

export const KeyNameBar = (props) => {
    const { filterKeyName } = props;
    return (
        <Grid container>
            <KeyNameGrid item xs={12}>
                <Typography variant="button" sx={{fontSize: "1rem", fontWeight: "bold"}}>
                    {filterKeyName}
                </Typography>
            </KeyNameGrid>
        </Grid>
    )
}


export default function FilterButtons(props) {
    const { filterKey, filterValues, filterKeyName, disableSelectAll = false } = props;

    // sort filterValues (list of string)
    const sortedFilterValues = [...filterValues].sort();

    const [currentFilter, setFilter] = useRecoilState(tmpFilterState);
    // currentFilter: dict of {filterKey1: [filterValue1, filterValue2, ...], filterKey2: [...], ...}

    const handleFilterClick = (filterValue) => {
        let thisFilter = currentFilter[filterKey] || [];
        if (thisFilter.includes(filterValue)) {
            thisFilter = thisFilter.filter(item => item !== filterValue);
            setFilter({...currentFilter, [filterKey]: thisFilter});
        } else {
            thisFilter = [...thisFilter, filterValue];
            setFilter({...currentFilter, [filterKey]: thisFilter});
        }
    };

    const selectAll = () => {
        let thisFilter = currentFilter[filterKey] || [];
        if (thisFilter.length === 0) {
            thisFilter = sortedFilterValues;
            setFilter({...currentFilter, [filterKey]: thisFilter})
        } else {
            thisFilter = [];
            setFilter({...currentFilter, [filterKey]: thisFilter})
        }
    };
    console.log("currentFilter", currentFilter)

    let filterButtons = filterValues.length > 0 ? sortedFilterValues.map((filterValue, i) =>
        <Grid item xs={4} sm={3} md={2} key={i}>
            <StyledButton variant="contained" disableElevation
                size="small"
                onClick={() => handleFilterClick(filterValue)}
                active={!currentFilter[filterKey].includes(filterValue)}
            >
                {filterValue}
            </StyledButton>
        </Grid>
    ) : [];

    // add "Select all" button to the beginning of filterButtons
    let selectAllButton = (
    <Grid item xs={4} sm={3} md={2} key={-1}>
        <SelectAllButton variant="contained" disableElevation
            size="small"
            onClick={selectAll}
        >Select all</SelectAllButton>
    </Grid>
    );

    filterButtons = [
        disableSelectAll ? null : selectAllButton,
        ...filterButtons
    ];

    return (
        <div>
            <KeyNameBar filterKeyName={filterKeyName} />
            <Grid container justify="flex-start" spacing={0} alignItems={"center"}>
                {filterButtons}
            </Grid>
        </div>
    )
}
