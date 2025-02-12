import {styled} from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

export const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.paper.default,
    borderStyle: 'solid',
    borderWidth: '0.5px',
    borderColor: theme.palette.paper.border,
}));


export const StyledDivider = styled(Divider)(({ theme }) => ({
    // backgroundColor: theme.palette.paper.border,
    width: "90%",
    marginTop: "32px !important",
    marginBottom: "24px !important",
    // 80% transparent
    // opacity: "0.6",
    // apply border color to after and before
    '&::before, &::after': {
        borderColor: theme.palette.paper.border,
        opacity: "0.9",
    },
}));

export const StyledBorderChip = styled(Chip)(({ theme }) => ({
    borderColor: theme.palette.paper.border,
    backgroundColor: theme.palette.paper.default,
    paddingLeft: "16px",
    paddingRight: "16px",
}));
