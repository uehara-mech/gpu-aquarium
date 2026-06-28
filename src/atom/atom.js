import { atom } from "recoil";

// Utility function to safely get parsed local storage value
const getParsedLocalStorage = (key, defaultVal) => {
    if (typeof window === "undefined" || !localStorage) {
        return defaultVal;
    }
    const storageValue = localStorage.getItem(key);
    if (!storageValue) {
        return defaultVal;
    }
    try {
        return JSON.parse(storageValue);
    } catch {
        return defaultVal;
    }
};

// Retrieve local settings with a specific key and default value
const getLocalSettings = (key, defaultVal) => {
    const storageValue = getParsedLocalStorage(key, {});
    return storageValue?.fixed ?? defaultVal;
};

const getSystemColorTheme = () => {
    if (typeof window === "undefined" || !window.matchMedia) {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// Utility function to set local storage value
const setLocalStorage = (key, value) => {
    if (typeof window !== "undefined" && localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// Retrieve local filter settings with a specific key and default value
const getLocalFilter = (key, defaultVal) => {
    const storageValue = getParsedLocalStorage("filter", {});
    const returnVal = storageValue[key] ?? defaultVal;
    console.log("getLocalFilter", key, returnVal);
    return returnVal;
};

export const gpuState = atom({
    key: "gpuState",
    default: null,
});

export const tmpFilterState = atom({
    key: "tmpFilterState",
    default: {
        gpu: [],
        memory: [],
        cuda: [],
        user: "",
        container: ["Docker", "Singularity"],
    },
});

export const FilterState = atom({
    key: "FilterState",
    default: {
        gpu: getLocalFilter("gpu", []),
        memory: getLocalFilter("memory", []),
        cuda: getLocalFilter("cuda", []),
        user: getLocalFilter("user", ""),
        container: getLocalFilter("container", ["Docker", "Singularity"]),
    },
});

export const themeState = atom({
    key: "themeState",
    default: {
        tmp: getLocalSettings("colorTheme", getSystemColorTheme()),
        fixed: getLocalSettings("colorTheme", getSystemColorTheme()),
    },
});

export const themeList = ["light", "dark"];

export const sortState = atom({
    key: "sortState",
    default: {
        tmp: getLocalSettings("sortOption", "hostname"),
        fixed: getLocalSettings("sortOption", "hostname"),
    },
});

export const sortOptions = {
    hostname: "Host Name",
    gpu_type: "GPU Type",
    gpu_usage: "GPU Usage",
    cpu_usage: "CPU Usage",
    cpu_memory: "CPU Memory",
};

export const sortDirectionState = atom({
    key: "sortDirectionState",
    default: {
        tmp: getLocalSettings("sortDirection", "column"),
        fixed: getLocalSettings("sortDirection", "column"),
    },
});

export const sortDirectionList = ["column", "row"];

export const betaFeatureState = atom({
    key: "betaFeatureState",
    default: {
        tmp: getLocalSettings("betaFeature", false),
        fixed: getLocalSettings("betaFeature", false),
    },
});


// Initialize default value for hidden node display option in localStorage
const hiddenNodeDefault = getParsedLocalStorage("showHiddenNode", { tmp: false, fixed: false });
if (typeof window !== "undefined" && localStorage && !localStorage.getItem("showHiddenNode")) {
    setLocalStorage("showHiddenNode", hiddenNodeDefault);
}

export const showHiddenNodeState = atom({
    key: "showHiddenNodeState",
    default: {
        tmp: getLocalSettings("showHiddenNode", false),
        fixed: getLocalSettings("showHiddenNode", false),
    },
});

export const userFilterValues = atom({
    key: "userFilterValues",
    default: {
        tmp: "",
        fixed: "",
    },
});
