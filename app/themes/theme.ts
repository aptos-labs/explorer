import {PaletteMode} from "@mui/material";
import {ThemeOptions} from "@mui/material/styles";
import {alpha} from "@mui/material";
import {getSemanticColors, brandColors} from "./colors/aptosBrandColors";
import React from "react";

// Button variants
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    nav: true;
    primary: true;
  }
}

// Divider variant - dotted
declare module "@mui/material/Divider" {
  interface DividerPropsVariantOverrides {
    dotted: true;
  }
}

declare module "@mui/material/styles" {
  interface TypographyVariants {
    stats: React.CSSProperties;
  }
  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    stats?: React.CSSProperties;
  }
}

declare module "@mui/material/styles" {
  interface Palette {
    lineShade: {
      main: string;
    };
    neutralShade: {
      main: string;
      lighter: string;
      darker: string;
    };
  }
}

// Divider variant - big stats
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    stats: true;
  }
}

// Divider variant - bump
declare module "@mui/material/Divider" {
  interface DividerPropsVariantOverrides {
    bump: true;
    bumpDark: true;
    bumpRight: true;
    bumpRightDark: true;
  }
}

const getDesignTokens = (mode: PaletteMode): ThemeOptions => {
  const semanticColors = getSemanticColors(mode);

  return {
    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily: `"IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightBold: 600,
      h1: {
        fontWeight: "600",
      },
      h2: {
        fontWeight: "600",
      },
      h3: {
        fontWeight: "600",
      },
      h4: {
        fontWeight: "600",
      },
      h5: {
        fontWeight: "600",
      },
      h6: {
        fontWeight: "600",
      },
      stats: {
        fontFamily: `"IBM Plex Mono",ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace`,
        fontWeight: "400",
      },
      subtitle1: {
        fontWeight: 400,
        textTransform: "uppercase",
        lineHeight: "1.25",
      },
      subtitle2: {
        fontWeight: 400,
        fontSize: "1rem",
        textTransform: "capitalize",
        lineHeight: "1.25",
      },
    },

    palette: {
      mode,
      ...(mode === "light"
        ? {
            // light mode palette values - using new brand colors
            primary: {
              main: semanticColors.primary,
            },

            secondary: {
              main: semanticColors.secondary,
            },

            success: {
              main: semanticColors.status.success,
            },

            error: {
              main: semanticColors.status.error,
            },

            warning: {
              main: semanticColors.status.warning,
            },

            background: {
              default: semanticColors.background.default,
              paper: semanticColors.background.paper,
            },

            text: {
              primary: semanticColors.text.primary,
              secondary: semanticColors.text.secondary,
              disabled: semanticColors.text.disabled,
            },

            lineShade: {
              main: semanticColors.border.main,
            },

            neutralShade: {
              main: brandColors.white,
              lighter: brandColors.white,
              darker: brandColors.creme,
            },
          }
        : {
            // dark mode palette values - using new brand colors
            primary: {
              main: semanticColors.primary,
            },

            secondary: {
              main: semanticColors.secondary,
            },

            success: {
              main: semanticColors.status.success,
            },

            error: {
              main: semanticColors.status.error,
            },

            warning: {
              main: semanticColors.status.warning,
            },

            background: {
              default: semanticColors.background.default,
              paper: semanticColors.background.paper,
            },

            text: {
              primary: semanticColors.text.primary,
              secondary: semanticColors.text.secondary,
              disabled: semanticColors.text.disabled,
            },

            lineShade: {
              main: semanticColors.border.main,
            },

            neutralShade: {
              main: brandColors.ink,
              lighter: brandColors.coal,
              darker: brandColors.black,
            },
          }),
    },

    components: {
      // Typography overrides
      MuiTypography: {
        styleOverrides: {
          subtitle2: {
            display: "block",
          },
        },
      },
      // Autocomplete overrides
      MuiAutocomplete: {
        styleOverrides: {
          root: () => ({
            listbox: {
              padding: "0",
            },
          }),
        },
      },

      // Link overrides
      MuiLink: {
        styleOverrides: {
          root: {
            fontWeight: "400",
          },
        },
      },

      // Paper overrides
      MuiPaper: {
        styleOverrides: {
          root: ({theme}) => ({
            backgroundImage: "none",
            borderRadius: theme.shape.borderRadius,
            transition: "none !important",
            boxShadow: "none",
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({theme}) => ({
            borderRadius: 0,
            transition: `transform 500ms !important`,
            boxShadow: `0 25px 50px -12px ${alpha(theme.palette.common.black, 0.25)}`,
          }),
          root: ({theme}) => ({
            zIndex: theme.zIndex.drawer,
          }),
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: ({theme}) => ({
            boxShadow: `0 25px 50px -12px ${alpha(theme.palette.common.black, 0.25)}`,
          }),
        },
      },

      MuiInput: {
        styleOverrides: {
          root: () => ({
            borderRadius: 2,
          }),
        },
      },

      MuiFilledInput: {
        styleOverrides: {
          root: ({theme}) => ({
            borderRadius: `${theme.shape.borderRadius}px`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.neutralShade.lighter
                : theme.palette.neutralShade.darker,
            transition: "none",
            "&.Mui-focused": {
              filter: `${
                theme.palette.mode === "dark"
                  ? "brightness(1.1)"
                  : "brightness(0.98)"
              }`,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.5)}`,
            },
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.neutralShade.main
                  : theme.palette.neutralShade.main,
              filter: `${
                theme.palette.mode === "dark"
                  ? "brightness(1.1)"
                  : "brightness(0.99)"
              }`,
            },
          }),
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: ({theme}) => ({
            "&.Mui-focused": {
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`,
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.lineShade.main,
            },
            "&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: alpha(theme.palette.primary.main, 0.35),
              },
          }),
        },
      },

      // Select overrides
      MuiSelect: {
        styleOverrides: {
          select: {
            borderRadius: "8px",
          },
          outlined: {
            backgroundColor: "transparent",
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            padding: 5,
            mt: 5,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: ({theme}) => ({
            borderRadius: theme.shape.borderRadius,
          }),
        },
      },

      // Table overrides
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: "separate",
            borderSpacing: "0px 0.5rem",
          },
        },
      },

      // Table Head overrides
      MuiTableHead: {
        styleOverrides: {
          root: {
            borderBottomWidth: "0",
            background: "transparent",
            borderSpacing: "0px",
          },
        },
      },

      // Table Body overrides
      MuiTableBody: {
        styleOverrides: {
          root: {
            position: "relative",
            "&::before": {
              content: '""',
              display: "block",
              height: 10,
            },
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          head: {
            background: "transparent",
          },
        },
      },

      // Table Cell overrides
      MuiTableCell: {
        styleOverrides: {
          head: {
            border: "0",
            background: "transparent",
            paddingBottom: "0",
          },
          root: ({theme}) => ({
            padding: "0.75rem 1.5rem 0.75rem 1.5rem",
            whiteSpace: "nowrap",
            borderStyle: "solid",
            borderWidth: "0 0 0 0",
            borderColor: theme.palette.lineShade.main,
            "&:first-of-type": {
              borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
            },
            "&:last-of-type": {
              borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
            },
          }),
        },
      },

      // Button overrides
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          disableFocusRipple: true,
          disableRipple: true,
        },
        styleOverrides: {
          root: ({theme}) => ({
            transition: "none !important",
            fontWeight: "400",
            "&:hover": {
              filter: "brightness(0.98)",
            },
            "&.Mui-disabled": {
              opacity: 0.5,
              color: theme.palette.text.disabled,
            },
          }),
        },
        variants: [
          {
            props: {variant: "primary"},
            style: ({theme}) => ({
              backgroundColor: theme.palette.primary.main,
              color:
                theme.palette.mode === "dark"
                  ? brandColors.black
                  : brandColors.white,
              fontSize: "1.1rem",
              padding: "12px 34px",
              minWidth: "8rem",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.9),
              },
            }),
          },
          {
            props: {variant: "nav"},
            style: ({theme}) => ({
              textTransform: "capitalize",
              color: theme.palette.text.secondary,
              fontSize: "1rem",
              fontWeight: "normal",
              "&:hover": {
                background: "transparent",
                opacity: "0.8",
              },
              "&.active": {},
            }),
          },
        ],
      },
    },
  };
};

export default getDesignTokens;
