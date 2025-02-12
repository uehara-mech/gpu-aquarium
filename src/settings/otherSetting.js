import React from 'react';
import {selector, useRecoilValue} from "recoil";


import DialogContent from '@mui/material/DialogContent';

import FilterButtons from "./filterButton";
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
