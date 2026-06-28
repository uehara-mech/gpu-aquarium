import React from 'react';

import DialogContent from '@mui/material/DialogContent';

import ThemeButton from "./themeButton";
import SortButton from "./sortButton";
import SortDirectionButton from "./sortDirectionButton";


export default function OtherSettingContent(props) {

    return (
        <DialogContent sx={{height: "360px"}}>
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
