import React from "react";
import Grid from "@mui/material/Grid";
import {KeyNameBar, StyledButton} from "./filterButton";
import {useRecoilState} from "recoil";
import {sortState, sortOptions} from "../atom/atom";


export default function SortButton() {
    const [sortOption, setSortOption] = useRecoilState(sortState);

    const handleSortClick = (sortOptionName) => {
        // update "tmp" sortOption
        setSortOption({...sortOption, tmp: sortOptionName});
    }

    let sortButtonList = [];
    for (let sortOptionName of Object.keys(sortOptions)) {
        let sortOptionDisplayName = sortOptions[sortOptionName];
        sortButtonList.push(
            <Grid item xs={6} sm={3} md={2} key={sortOptionName} sx={{p: {xs: 0.5, sm: 0}, display: "flex", alignItems: "stretch"}}>
                <StyledButton
                    variant="contained"
                    disableElevation
                    size="small"
                    onClick={() => handleSortClick(sortOptionName)}
                    active={sortOptionName === sortOption["tmp"]}
                >{sortOptionDisplayName}</StyledButton>
            </Grid>
        )
    }

    return (
        <div>
            <KeyNameBar filterKeyName={"SORT"} />
            <Grid container justifyContent={"flex-start"} spacing={1} alignItems={"stretch"}>
                {sortButtonList}
            </Grid>
        </div>
    )
}
