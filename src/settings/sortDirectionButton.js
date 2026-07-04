import React from "react";
import Grid from "@mui/material/Grid";
import {SvgIcon} from "@mui/material";
import {KeyNameBar, StyledButton} from "./filterButton";
import {useRecoilState} from "recoil";
import {sortDirectionState, sortDirectionList} from "../atom/atom";

import { ReactComponent as ArrowLeftToRight } from '../assets/left-to-right.svg';
import { ReactComponent as ArrowTopToDown } from '../assets/up-to-down.svg';


const LeftToRightIcon = (props) => <SvgIcon {...props} viewBox={"0 0 913 913"} sx={{fontSize: 32}}><ArrowLeftToRight /></SvgIcon>;
const TopToDownIcon = (props) => <SvgIcon {...props} viewBox={"0 0 913 913"}  sx={{fontSize: 32}}><ArrowTopToDown /></SvgIcon>;


export default function SortDirectionButton() {
    const [sortDirection, setSortDirection] = useRecoilState(sortDirectionState);

    const handleSortClick = (sortDirectionName) => {
        // update "tmp" sortDirection
        setSortDirection({...sortDirection, tmp: sortDirectionName});
    }

    let sortDirectionButtonList = [];
    for (let sortDirectionName of sortDirectionList) {
        sortDirectionButtonList.push(
            <Grid item xs={6} sm={3} md={2} key={sortDirectionName} sx={{p: {xs: 0.5, sm: 0}}}>
                <StyledButton
                    variant="contained"
                    startIcon={sortDirectionName === "row" ? <LeftToRightIcon /> : <TopToDownIcon />}
                    disableElevation
                    size="small"
                    onClick={() => handleSortClick(sortDirectionName)}
                    active={sortDirectionName === sortDirection["tmp"]}
                >{sortDirectionName}</StyledButton>
            </Grid>
        )
    }

    return (
        <div>
            <KeyNameBar filterKeyName={"SORT DIRECTION"} />
            <Grid container justifyContent={"flex-start"} spacing={1} alignItems={"center"}>
                {sortDirectionButtonList}
            </Grid>
        </div>
    )
}
