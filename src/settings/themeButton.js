import React from "react";
import Grid from "@mui/material/Grid";
import {KeyNameBar, StyledButton} from "./filterButton";
import {useRecoilState} from "recoil";
import {themeState, themeList} from "../atom/atom";
import {getDesignTokens} from "../theme";
import {createTheme} from "@mui/material/styles";


export default function ThemeButton() {
    const [themeStateValue, setTheme] = useRecoilState(themeState);

    const handleThemeClick = (themeName) => {
        // update "tmp" theme
        setTheme({...themeStateValue, tmp: themeName});
        // overwrite <body> style
        let backgroundColor = createTheme(getDesignTokens(themeName)).palette.background.default;
        document.body.style.backgroundColor = backgroundColor;
    }

    let themeButtonList = [];
    for (let themeName of themeList) {
        themeButtonList.push(
            <Grid item xs={6} sm={3} md={2} key={themeName} sx={{p: {xs: 0.5, sm: 0}}}>
                <StyledButton
                    variant="contained"
                    disableElevation
                    size="small"
                    onClick={() => handleThemeClick(themeName)}
                    active={themeName === themeStateValue["tmp"]}
                >{themeName}</StyledButton>
            </Grid>
        )
    }

    return (
        <div>
            <KeyNameBar filterKeyName={"THEME"} />
            <Grid container justifyContent={"flex-start"} spacing={1} alignItems={"center"}>
                {themeButtonList}
            </Grid>
        </div>
    )
}
