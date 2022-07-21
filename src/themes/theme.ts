import {PaletteMode} from "@mui/material";
import {ThemeOptions} from "@mui/material/styles";
import {grey, teal} from "@mui/material/colors";
import "@mui/material/styles/createPalette";
import {alpha} from "@mui/material";
import {Palette} from "@mui/icons-material";

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

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    neutralShade: {main: string};
    lineShade: {
      main: string;
      increased: string;
      reduced: string;
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
  }
}

// Divider variant - bump (dark mode)
declare module "@mui/material/Divider" {
  interface DividerPropsVariantOverrides {
    bumpDark: true;
  }
}

// Divider variant - bump (right side)
declare module "@mui/material/Divider" {
  interface DividerPropsVariantOverrides {
    bumpRight: true;
  }
}

// Divider variant - bump (right side dark mode)
declare module "@mui/material/Divider" {
  interface DividerPropsVariantOverrides {
    bumpRightDark: true;
  }
}

const primaryColor = teal["A400"];
const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  shape: {
    borderRadius: 8,
  },
  // default font config
  typography: {
    fontFamily: `lft-etica-mono,ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace`,
    fontWeightLight: 200,
    fontWeightRegular: 300,
    fontWeightBold: 400,
    h1: {
      fontFamily: `apparat-semicond,Geneva,Tahoma,Verdana,sans-serif`,
      fontWeight: "300",
    },
    h2: {
      fontFamily: `apparat-semicond,Geneva,Tahoma,Verdana,sans-serif`,
      fontWeight: "300",
    },
    h3: {
      fontFamily: `apparat-semicond,Geneva,Tahoma,Verdana,sans-serif`,
      fontWeight: "300",
    },
    h4: {
      fontFamily: `apparat-semicond,Geneva,Tahoma,Verdana,sans-serif`,
      fontWeight: "300",
    },
    h5: {
      fontFamily: `apparat-semicond,Geneva,Tahoma,Verdana,sans-serif`,
      fontWeight: "300",
    },
    h6: {
      fontFamily: `apparat-semicond,Geneva,Tahoma,Verdana,sans-serif`,
      fontWeight: "300",
    },
    stats: {
      fontFamily: `lft-etica-mono,ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace`,
      fontWeight: "normal",
    },
    subtitle1: {
      fontWeight: 400,
      textTransform: "uppercase",
      lineHeight: "1.25",
    },
    subtitle2: {
      fontWeight: 400,
      fontSize: "1rem",
      textTransform: "uppercase",
      lineHeight: "1.25",
    },
  },

  palette: {
    mode,
    ...(mode === "light"
      ? {
          // light mode palette values
          primary: {
            main: teal["A700"],
          },

          secondary: {
            main: grey[700],
          },

          success: {
            main: teal["A700"],
          },

          background: {
            default: grey[50],
            paper: "#fdfdfd",
          },

          text: {
            primary: grey[900],
            secondary: grey[600],
          },

          lineShade: {
            main: grey[400],
            increased: grey[500],
            reduced: grey[300],
          },

          neutralShade: {
            main: "#fdfdfd",
          },
        }
      : {
          // dark mode palette values
          primary: {
            main: primaryColor,
          },

          secondary: {
            main: grey[300],
          },

          success: {
            main: primaryColor,
          },

          background: {
            default: "rgb(23,23,23)",
            paper: grey[900],
          },

          text: {
            primary: grey[200],
            secondary: grey[500],
          },

          lineShade: {
            main: grey[600],
            increased: grey[500],
            reduced: "#333333",
          },

          neutralShade: {
            main: "#1C1C1C",
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
        listbox: {
          padding: "0",
        },
        option: {
          background: "none",
          padding: "0!important",
          borderRadius: "8px",
          "&:empty": {
            display: "none!important",
          },
          "&::hover": {
            background: "none",
            padding: "0",
          },
          '&[aria-selected="true"]': {
            backgroundColor: "grey",
            padding: "0",
          },
          '&[aria-selected="true"].Mui-focused': {
            backgroundColor: "grey",
            padding: "0",
          },
          "&.Mui-selected": {
            backgroundColor: "grey",
            padding: "0",
          },
          "&.Mui-selected.Mui-focused": {
            backgroundColor: "grey",
            padding: "0",
          },
          "&.Mui-focused": {
            backgroundColor: "transparent",
            padding: "0",
          },
        },
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
        root: {
          backgroundImage: "none",
          borderRadius: 8,
          transition: "none !important",
          boxShadow: "none",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({theme}) => ({
          //boxShadow: "0px 4px 8px 0px rgb(0 0 0 / 5%)!important",
          border: "0!important",
          backgroundColor: theme.palette.background.paper,
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.lineShade.reduced,
          },
          "&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: theme.palette.lineShade.main,
              boxShadow: "0px 4px 8px -3px rgb(0 0 0 / 10%)!important",
            },
        }),
      },
    },

    // Select overrides
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: "8px",
          textTransform: "capitalize",
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
        root: {
          textTransform: "capitalize",
          borderRadius: 8,
        },
      },
    },

    // Divider overrides
    MuiDivider: {
      variants: [
        {
          props: {variant: "dotted"},
          style: {
            borderStyle: "dotted",
            borderWidth: "0 0 2px",
          },
        },
        {
          props: {variant: "bump"},
          style: {
            transform: "translateY(-20px)",
            border: `0`,
            height: "20px",
            background: "transparent",
            position: "relative",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              bottom: "0",
              willChange: "transform",
            },
            "&::before": {
              display: "block",
              width: "100%",
              height: "1px",
              background: `${teal["A700"]}`,
              maskClip: "content-box",
              maskImage: `-webkit-linear-gradient(black, black),
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="6" viewBox="0 0 14 6"><rect fill="black" x="0" y="0" width="13" height="6"></rect></svg>')`,
              maskPosition: `0 0, 20%`,
              maskRepeat: "no-repeat",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            },
            "&::after": {
              width: "14px",
              height: "6px",
              backgroundSize: "100%",
              backgroundRepeat: "none",
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6"><path d="M0,5.5a2.09,2.09,0,0,0,1.51-.64L4.66,1.53a3.36,3.36,0,0,1,4.69-.15,2.28,2.28,0,0,1,.22.22l2.88,3.21A2.08,2.08,0,0,0,14,5.5" fill="none" stroke="%23${teal[
                "A700"
              ].substring(1)}" stroke-miterlimit="10"/></svg>')`,
              transform: `translateX(calc(-1 * 20%))`,
              left: "20%",
            },
          },
        },
        {
          props: {variant: "bumpDark"},
          style: {
            transform: "translateY(-20px)",
            border: `0`,
            height: "20px",
            background: "transparent",
            position: "relative",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              bottom: "0",
              willChange: "transform",
            },
            "&::before": {
              display: "block",
              width: "100%",
              height: "1px",
              background: `${primaryColor}`,
              maskClip: "content-box",
              maskImage: `-webkit-linear-gradient(black, black),
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="6" viewBox="0 0 14 6"><rect fill="white" x="0" y="0" width="13" height="6"></rect></svg>')`,
              maskPosition: `0 0, 20%`,
              maskRepeat: "no-repeat",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            },
            "&::after": {
              width: "14px",
              height: "6px",
              backgroundSize: "100%",
              backgroundRepeat: "none",
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6"><path d="M0,5.5a2.09,2.09,0,0,0,1.51-.64L4.66,1.53a3.36,3.36,0,0,1,4.69-.15,2.28,2.28,0,0,1,.22.22l2.88,3.21A2.08,2.08,0,0,0,14,5.5" fill="none" stroke="%23${primaryColor.substring(
                1,
              )}" stroke-miterlimit="10"/></svg>')`,
              transform: `translateX(calc(-1 * 20%))`,
              left: "20%",
            },
          },
        },
        {
          props: {variant: "bumpRight"},
          style: {
            marginTop: "-20px",
            border: `0`,
            height: "20px",
            background: "transparent",
            marginBottom: "4rem",
            position: "relative",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              bottom: "0",
              willChange: "transform",
            },
            "&::before": {
              display: "block",
              width: "100%",
              height: "1px",
              background: "black",
              maskClip: "content-box",
              maskImage: `-webkit-linear-gradient(black, black),
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="6" viewBox="0 0 14 6"><rect fill="black" x="0" y="0" width="13" height="6"></rect></svg>')`,
              maskPosition: `0 0, 78%`,
              maskRepeat: "no-repeat",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            },
            "&::after": {
              width: "14px",
              height: "6px",
              backgroundSize: "100%",
              backgroundRepeat: "none",
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6"><path d="M0,5.5a2.09,2.09,0,0,0,1.51-.64L4.66,1.53a3.36,3.36,0,0,1,4.69-.15,2.28,2.28,0,0,1,.22.22l2.88,3.21A2.08,2.08,0,0,0,14,5.5" fill="none" stroke="black" stroke-miterlimit="10"/></svg>')`,
              transform: `translateX(calc(-1 * 78%))`,
              left: "78%",
            },
          },
        },
        {
          props: {variant: "bumpRightDark"},
          style: {
            transform: "translateY(-20px)",
            border: `0`,
            height: "20px",
            background: "transparent",
            position: "relative",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              bottom: "0",
              willChange: "transform",
            },
            "&::before": {
              display: "block",
              width: "100%",
              height: "1px",
              background: `${primaryColor}`,
              maskClip: "content-box",
              maskImage: `-webkit-linear-gradient(black, black),
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="6" viewBox="0 0 14 6"><rect fill="white" x="0" y="0" width="13" height="6"></rect></svg>')`,
              maskPosition: `0 0, 78%`,
              maskRepeat: "no-repeat",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            },
            "&::after": {
              width: "14px",
              height: "6px",
              backgroundSize: "100%",
              backgroundRepeat: "none",
              backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6"><path d="M0,5.5a2.09,2.09,0,0,0,1.51-.64L4.66,1.53a3.36,3.36,0,0,1,4.69-.15,2.28,2.28,0,0,1,.22.22l2.88,3.21A2.08,2.08,0,0,0,14,5.5" fill="none" stroke="%23${primaryColor.substring(
                1,
              )}" stroke-miterlimit="10"/></svg>')`,
              transform: `translateX(calc(-1 * 78%))`,
              left: "78%",
            },
          },
        },
      ],
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
        root: {
          padding: "1rem 2rem 1rem 1rem",
          whiteSpace: "nowrap",
          borderStyle: "dotted",
          borderWidth: "0 0 0",
          "&:first-of-type": {
            borderRadius: "8px 0 0 8px",
          },
          "&:last-of-type": {
            borderRadius: "0 8px 8px 0",
          },
        },
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
        root: {
          transition: "none !important",
          fontWeight: "400",
          // boxShadow: "0px 4px 8px -3px rgb(0 0 0 / 10%)!important",
          "&:hover": {
            filter: "brightness(0.95)",
          },
          "&.Mui-disabled": {
            opacity: 0.5,
            color: "black",
          },
        },
      },
      variants: [
        {
          props: {variant: "primary"},
          style: {
            backgroundColor: alpha(primaryColor, 1),
            color: "black",
            fontSize: "1.1rem",
            padding: "12px 34px",
            minWidth: "8rem",
            "&:hover": {
              backgroundColor: alpha(primaryColor, 1),
            },
          },
        },
        {
          props: {variant: "nav"},
          style: {
            textTransform: "capitalize",
            color: grey[300],
            fontSize: "1rem",
            fontWeight: "normal",
            "&:hover": {
              background: "transparent",
              opacity: "0.8",
            },
            "&.active": {},
          },
        },
      ],
    },
  },
});

export default getDesignTokens;
