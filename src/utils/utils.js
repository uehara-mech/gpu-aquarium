import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {styled} from "@mui/material/styles";
import {Alert, CircularProgress} from "@mui/material";

export const getMemoryTotal = (memoryTotal) => {
    let memoryTotalGB = Math.floor(parseInt(memoryTotal) / 1024);
    return memoryTotalGB.toString() + "GB";
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
