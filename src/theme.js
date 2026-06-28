import { createTheme } from '@mui/material/styles';
import {blue, grey, pink} from '@mui/material/colors';
import {alpha} from "@mui/material";


// we use three different themes for the app
// mode is "classic", "dark" or "light"
export const getDesignTokens = (mode) => {
    if (mode === 'light') {
        return {
            palette: {
                mode,
                info: {
                    main: blue[500],
                    light: blue[400],
                },
                background: {
                  default: '#f1f2f6',
                },
                paper: {
                    default: "#fbfbfb",
                    light: "#ffffff",
                    corner: grey[600],
                    border: grey[500],
                    transparent: "#fbfbfb",
                    borderHeader: "#5d6568b3"
                },
                progress: {
                    background: "#fca70a",
                    border: grey[600]
                },
                chipBorder: grey[400],
                chipBackground: "rgba(0,0,0,0)",
                chipTitleBackground: grey[300],
                button: {
                    hover: grey[200],
                    border: grey[500]
                },
                settingButton: {
                    active: {
                        default: "#8ddcfe",
                        hover: "#87c7e2"
                    },
                    deactive: {
                        default: grey[400],
                        hover: grey[500]
                    },
                    selectAllButton: {
                        default: "#ffb557",
                        hover: "#c48000"
                    },
                    otherSettingButton: {
                        active: {
                            default: blue[500],
                            hover: blue[600],
                            text: "#ffffff"
                        },
                        deactive: {
                            default: "transparent",
                            hover: grey[200],
                            text: "#000000"
                        },
                        border: blue[500]
                    },
                },
                detailButton: {
                        default: {
                            operational: grey[500],
                            error: '#f94f4f',
                            warning: '#f7b62d'
                        },
                        hover: {
                            operational: grey[600],
                            error: '#f94f4f',
                            warning: '#f7b62d'
                        }
                    },
                gpuIcon: {
                    free: "#5FC0DD",
                    used: "#EFAC56",
                    alert: "#D75452"
                },
                warningAlert: {
                    background: "#ffebc7",
                    border: "#e49500"
                },
                historyButton: {
                    default: "#fbfbfb",
                    hover: "#f1f1f1",
                    border: "#898989",
                    text: "#1f1f1f"
                },
                type: 'light'
            },
        };
    } else if (mode === 'dark') {
        return {
            palette: {
                mode,
                primary: {
                    main: "#313E44",
                    dark: "#313E44"
                },
                info: {
                    main: "#02040A",
                    dark: "#02040A"
                },
                background: {
                    default: "#040916",
                },
                paper: {
                    default: "#161B22",
                    light: "#1b212a",
                    corner: "#5d91c4",
                    border: "#79aaffb3",
                    transparent: alpha("#161B22", 0.7),
                    borderHeader: "#ffffffb3"
                },
                progress: {
                    background: "#287dcd",
                    border: grey[600]
                },
                chipBorder: grey[700],
                chipBackground: "#7474741f",
                chipTitleBackground: "#4b5c6a",
                button: {
                    hover: "#ffffff29",
                    border: grey[500]
                },
                settingButton: {
                    active: {
                        default: "#8ddcfe",
                        hover: "#87c7e2"
                    },
                    deactive: {
                        default: grey[400],
                        hover: grey[500]
                    },
                    selectAllButton: {
                        default: "#e6a34f",
                        hover: "#c48000"
                    },
                    otherSettingButton: {
                        active: {
                            default: "#8ddcfe",
                            hover: "#87c7e2",
                            text: "#000000"
                        },
                        deactive: {
                            default: "transparent",
                            hover: grey[700],
                            text: "#ffffff"
                        },
                        border: "#8ddcfe"
                    },
                },
                detailButton: {
                        default: {
                            operational: grey[500],
                            error: '#c33838',
                            warning: '#c39e38'
                        },
                        hover: {
                            operational: grey[600],
                            error: '#c33838',
                            warning: '#c39e38'
                        }
                    },
                gpuIcon: {
                    free: "#3f9ab5",
                    used: "#c7852f",
                    alert: "#bb3a38"
                },
                warningAlert: {
                    background: "#232323",
                    border: "#b87a08"
                },
                historyButton: {
                    default: "#161B22",
                    hover: "#282828",
                    border: "#898989",
                    text: "#ffffff"
                },
                type: 'dark'
            }
        };
    }
}

const theme = createTheme(getDesignTokens('light'));

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: "#313E44",
            dark: "#313E44"
        },
        secondary: pink,
        info: {
            main: "#313E44",
            dark: "#313E44"
        },
        background: {
            default: "#1B2225",
            paper: "#243137"
        },
        text: {
            primary: "rgba(255, 255, 255, 0.92)"
        },
        gpuHeaderText: "rgba(255, 255, 255, 0.92)",
        settingButton: "#8ddcfe",
        saveButton: "#8ddcfe",
        saveButtonHover: "#8ddcfecc",
        settingActive: "#8ddcfe",
        settingActiveHover: "#7BBDD9",
        paperBorder: "#79aaffb3",
        table: {
            header: "#243137",
            odd: "#38454B",
            even: "#243137"
        },
        gpuDetailPaper: "#243137",
        gpuIcon: {
            free: "#3f9ab5",
            used: "#c7852f",
            alert: "#bb3a38"
        },
        gpuBar: {
            free: "#c9c9c9",
            used: "#d58d09"
        },
        infoIcon: "#ffffffe6",
        type: 'dark'
    }
})

export const classicTheme = createTheme({
    palette: {
        // mode: 'classic',
        primary: {
            main: "#585858",
            dark: "#313E44"
        },
        info: {
            main: "#585858",
            dark: "#313E44"
        },
        secondary: pink,
        gpuHeaderText: "#ffffff",
        settingButton: "#ffffff",
        saveButton: "#1976d2",
        saveButtonHover: "#1976d2b3",
        settingActive: "#8ddcfe",
        settingActiveHover: "#7BBDD9",
        gpuDetailPaper: "#dcdcdc",
        table: {
            header: "#dedede",
            odd: "#FAFAFA",
            even: "#EFEFEF"
        },
        gpuIcon: {
            free: "#5FC0DD",
            used: "#EFAC56",
            alert: "#D75452"
        },
        gpuBar: {
            free: "#e8e8e8",
            used: "#ffa500"
        },
        infoIcon: "#ffffff"
    },
});

export default theme;
