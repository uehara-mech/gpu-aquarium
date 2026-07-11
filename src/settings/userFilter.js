import React, { useEffect, useState } from 'react';
import { selector, useRecoilState, useRecoilValue } from "recoil";
import { gpuState, tmpFilterState } from "../atom/atom";
import { Autocomplete, TextField } from "@mui/material";
import { KeyNameBar } from "./filterButton";
import { styled } from "@mui/material/styles";

const createUserFilterValuesList = selector({
    key: 'createUserFilterValuesList',
    get: ({ get }) => {
        const allData = get(gpuState);
        const userNames = new Set();
        for (let hostName in allData) {
            const users = Array.isArray(allData[hostName].users) ? allData[hostName].users : [];
            for (const userName of users) {
                userNames.add(userName);
            }
        }
        return [...userNames];
    }
});

const CustomTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.7)', // フォーカス時の色
        },
    },
    '& .MuiInputLabel-root': {
        '&.Mui-focused': {
            color: 'rgba(255, 255, 255, 0.7)', // フォーカス時のラベルの色
        },
    },
});

export default function UserFilter(props) {
    const userFilterValuesList = useRecoilValue(createUserFilterValuesList);
    const [currentFilter, setFilter] = useRecoilState(tmpFilterState);
    const [inputValue, setInputValue] = useState(currentFilter.user);

    useEffect(() => {
        setInputValue(currentFilter.user);
    }, [currentFilter.user]);

    const handleInputChange = (event, newInputValue) => {
        setInputValue(newInputValue);
        setFilter((prevFilter) => ({
            ...prevFilter,
            user: newInputValue
        }));
    };

    return (
        <div>
            <KeyNameBar filterKeyName={"USER"} />
            <Autocomplete
                id="free-solo-demo"
                sx={{ width: "50%", margin: "8px 3px 8px 8px" }}
                size={"small"}
                freeSolo
                options={inputValue.length > 0 ? userFilterValuesList : []}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                renderInput={(params) => <CustomTextField
                    {...params} label="user name"
                    variant={"filled"}
                />}
            />
        </div>
    );
}
