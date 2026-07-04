import React from 'react';
import {selector, useRecoilValue} from "recoil";


import DialogContent from '@mui/material/DialogContent';

import FilterButtons from "./filterButton";
import UserFilter from "./userFilter";
import {gpuState} from "../atom/atom";

const createGpuFilterValues = selector({
    key: 'createGpuFilterValues',
    get: ({get}) => {
        const allData = get(gpuState);
        if (!allData || Array.isArray(allData)) {
            return [];
        }

        let gpuNameList = [];
        for (let hostName in allData) {
            if (allData[hostName].gpu_info.length === 0) {
                continue;
            }
            gpuNameList.push(allData[hostName].basic_info.gpu_name);
        }
        // remove duplicated values
        gpuNameList = [...new Set(gpuNameList)];
        return gpuNameList;
    }
});

const createMemoryFilterValues = selector({
    key: 'createMemoryFilterValues',
    get: ({get}) => {
        const allData = get(gpuState);
        if (!allData || Array.isArray(allData)) {
            return [];
        }

        let memoryList = [];
        for (let hostName in allData) {
            if (allData[hostName].gpu_info.length === 0) {
                continue;
            }
            let memory_total = allData[hostName].gpu_info[0].memory_total;
            // parse memory_total to GB
            // e.g., memory_total: "49140 MiB" -> "49GB"
            let memory_total_GB = Math.floor(parseInt(memory_total) / 1024);
            let memory_total_str = memory_total_GB.toString() + "GB";
            if (!memoryList.includes(memory_total_str)) {
                memoryList.push(memory_total_str);
            }
        }
        // remove duplicated values
        memoryList = [...new Set(memoryList)];
        return memoryList;
    }
});


const createCudaFilterValues = selector({
    key: 'createCudaFilterValues',
    get: ({get}) => {
        const allData = get(gpuState);
        if (!allData || Array.isArray(allData)) {
            return [];
        }

        let cudaList = [];
        for (let hostName in allData) {
            let cuda_versions = allData[hostName].basic_info.cuda_versions;
            for (let cuda_version of cuda_versions) {
                if (!cudaList.includes(cuda_version)) {
                    cudaList.push(cuda_version);
                }
            }
        }
        return cudaList;
    }
});



export default function FilterSettingContent(props) {
    const gpuFilterValues = useRecoilValue(createGpuFilterValues);
    const memoryFilterValues = useRecoilValue(createMemoryFilterValues);
    const cudaFilterValues = useRecoilValue(createCudaFilterValues);
    const containerFilterValues = ["Docker", "Singularity"];

    return (
        <DialogContent sx={{height: {xs: "min(62vh, 520px)", sm: "360px"}, px: {xs: 0, sm: 3}, py: {xs: 1, sm: 2}}}>
            <div>
                {/*<GpuFilterButtons />*/}
                <FilterButtons
                    filterKey={"gpu"}
                    filterValues={gpuFilterValues}
                    filterKeyName={"GPU"}
                />
            </div>
            <div>
                <FilterButtons
                    filterKey={"memory"}
                    filterValues={memoryFilterValues}
                    filterKeyName={"Memory"}
                />
            </div>
            <div>
                <FilterButtons
                    filterKey={"cuda"}
                    filterValues={cudaFilterValues}
                    filterKeyName={"CUDA"}
                />
            </div>
            <div>
                <FilterButtons
                    filterKey={"container"}
                    filterValues={containerFilterValues}
                    filterKeyName={"Container"}
                    disableSelectAll={true}
                />
            </div>
            <div>
                <UserFilter />
            </div>
        </DialogContent>
    );
}
