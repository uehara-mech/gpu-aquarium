import {FilterState, sortDirectionState, sortState, themeState} from "../atom/atom";
import {useRecoilState} from "recoil";
import React, {useEffect} from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {styled} from "@mui/material/styles";
import {Alert, CircularProgress} from "@mui/material";

export const getMemoryTotal = (memoryTotal) => {
    let memoryTotalGB = Math.floor(parseInt(memoryTotal) / 1024);
    return memoryTotalGB.toString() + "GB";
}


export function useLoadSettings() {
    const [colorTheme, setColorTheme] = useRecoilState(themeState);
    const [sortOption, setSortOption] = useRecoilState(sortState);
    const [sortDirection, setSortDirection] = useRecoilState(sortDirectionState);
    const [filterState, setFilterState] = useRecoilState(FilterState)

    useEffect(() => {
        const storedColorTheme = localStorage.getItem('colorTheme');
        if (storedColorTheme) {
            setColorTheme({...colorTheme, "fixed": storedColorTheme["fixed"]});
            console.log('Stored color data:', storedColorTheme);
        }

        const storedSortOption = localStorage.getItem('sortOption');
        if (storedSortOption) {
            setSortOption({...sortOption, "fixed": storedSortOption["fixed"]});
            console.log('Stored sort option data:', storedSortOption);
        }

        const storedSortDirection = localStorage.getItem('sortDirection');
        if (storedSortDirection) {
            setSortDirection({...sortDirection, "fixed": storedSortDirection["fixed"]});
            console.log('Stored sort direction data:', storedSortDirection);
        }

        const storedFilter = localStorage.getItem('filter');
        if (storedFilter) {
            setFilterState({...filterState, "fixed": storedFilter["fixed"]});
            console.log('Stored filter data:', storedFilter);
        }
        console.log('Current state:', colorTheme, sortOption, sortDirection, filterState);
    }, []);

}


const StyledCircularProgress = styled(CircularProgress) ({
    color: "#00a3d1",
    width: "70px !important",
    height: "70px !important",
});

export const LoadingCircle = () => {
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "80vh"}}>
            <Stack direction={"column"} justifyContent="center" alignItems="center" spacing={2}>
                <StyledCircularProgress/>
                <Typography variant="h5"
                            sx={{fontFamily: 'Titillium Web', fontWeight: "600", marginTop: "30px !important"}}>
                    Loading...
                </Typography>
            </Stack>
        </div>
    )
}

export const StyledWarningAlert = styled(Alert) (({theme}) => ({
    marginBottom: "8px",
    width: "fit-content",
    padding: "32px 64px",
    marginTop: "128px",
    fontHeight: "1.2rem",
    alignItems: "center",
    backgroundColor: theme.palette.warningAlert.background,
    borderWidth: "3px",
    borderStyle: "solid",
    borderColor: theme.palette.warningAlert.border
}));