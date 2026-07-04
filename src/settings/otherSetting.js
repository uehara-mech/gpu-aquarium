import React from 'react';

import DialogContent from '@mui/material/DialogContent';

import ThemeButton from "./themeButton";
import SortButton from "./sortButton";
import SortDirectionButton from "./sortDirectionButton";


export default function OtherSettingContent(props) {

    return (
        <DialogContent sx={{height: {xs: "min(62vh, 520px)", sm: "360px"}, px: {xs: 0, sm: 3}, py: {xs: 1, sm: 2}}}>
            <div>
                <ThemeButton />
            </div>
            <div>
                <SortButton />
            </div>
            <div>
                <SortDirectionButton />
            </div>
        </DialogContent>
    );
}
