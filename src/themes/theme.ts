import {PaletteMode} from "@mui/material";
import {ThemeOptions} from "@mui/material/styles";
import {grey, teal} from "@mui/material/colors";
import shadows, {Shadows} from "@mui/material/styles/shadows";
import "@mui/material/styles/createPalette";
import {alpha} from "@mui/material";

// Button variant - CTA stacked
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    cta: true;
  }
}

// Divider variant - dotted
declare module "@mui/material/Divider" {
  interface DividerPropsVariantOverrides {
    dotted: true;
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

const buttonRadiusOffset = 3;
const primaryColor = teal["A400"];
const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  // disable shadows system-wide by default
  shadows: shadows.map(() => "none") as Shadows,

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
      fontFamily: `apparat-semicond-light,Geneva,Tahoma,Verdana,sans-serif`,
      fontWeight: 100,
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: "1.3rem",
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

          typography: {
            allVariants: {
              color: grey[900],
            },
          },

          success: {
            main: teal["A700"],
          },

          background: {
            default: "#FFFFFF",
            paper: grey[100],
          },
        }
      : {
          // dark mode palette values
          primary: {
            main: primaryColor,
          },

          typography: {
            allVariants: {
              color: grey[200],
            },
          },

          success: {
            main: primaryColor,
          },

          background: {
            default: "#151515",
            paper: "#222222",
          },
        }),
  },

  components: {
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
        },
      },
    },

    // Select overrides
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: "8px",
          textTransform: "uppercase",
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
          textTransform: "uppercase",
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
          borderCollapse: "collapse",
        },
      },
    },

    // Table Head overrides
    MuiTableHead: {
      styleOverrides: {
        root: {
          borderBottomWidth: "0",
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
            height: "1em",
          },
        },
      },
    },

    // Table Cell overrides
    MuiTableCell: {
      styleOverrides: {
        head: {
          border: "0",
        },
        root: {
          fontSize: "1.05rem",
          // fontWeight: '400',
          padding: "1rem 2rem 1rem 0.5rem",
          whiteSpace: "nowrap",
          borderStyle: "dotted",
          borderWidth: "0 0 2px",
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
      variants: [
        {
          props: {variant: "cta"},
          style: {
            fontSize: "1.1rem",
            padding: "12px 34px",
            border: `0`,
            borderRadius: "2px 12px",
            color: "black",
            width: "auto",
            margin: "auto",
            transform: "translateY(6px)",
            backgroundColor: alpha(primaryColor, 1),
            position: "relative",
            zIndex: "1",
            lineHeight: "2",
            transitionProperty: "all",
            transitionDuration: "0.25s",
            transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",

            "&::before, &::after": {
              content: '""',
              position: "absolute",
              backgroundColor: alpha(primaryColor, 0.65),
              width: "100%",
              height: "100%",
              transitionProperty: "all",
              transitionDuration: "0.35s",
              transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
              left: "0",
              top: "0",
            },
            "&::before": {
              zIndex: "-1",
              boxShadow: `-${buttonRadiusOffset}px ${buttonRadiusOffset}px 0px 0px ${alpha(
                primaryColor,
                0.35,
              )}`,
              borderRadius: `${buttonRadiusOffset * 2}px 12px ${
                buttonRadiusOffset * 2
              }px 12px`,
              transform: `translateX(-${buttonRadiusOffset}px) translateY(0px)`,
              width: `calc(100% + ${buttonRadiusOffset}px)`,
              height: `calc(100% + ${buttonRadiusOffset}px)`,
              //opacity:'0'
            },
            "&::after": {
              zIndex: "-2",
              boxShadow: `${buttonRadiusOffset}px -${buttonRadiusOffset}px 0px 0px ${alpha(
                primaryColor,
                0.35,
              )}`,
              borderRadius: `${buttonRadiusOffset * 2}px 12px ${
                buttonRadiusOffset * 2
              }px 12px`,
              transform: `translateX(0px) translateY(-${buttonRadiusOffset}px)`,
              width: `calc(100% + ${buttonRadiusOffset}px)`,
              height: `calc(100% + ${buttonRadiusOffset}px)`,
              //opacity: '0'
            },
            "&:hover": {
              backgroundColor: alpha(primaryColor, 1),
              opacity: "0.95",
              transform: "translateY(4px)",
              borderRadius: "12px",
              "&::before": {
                transform: `translateX(${buttonRadiusOffset}px) translateY(0)`,
                borderRadius: "12px",
                width: `calc(100% - ${buttonRadiusOffset}px)`,
                height: `calc(100% - ${buttonRadiusOffset}px)`,
              },
              "&::after": {
                transform: `translateX(0px) translateY(${buttonRadiusOffset}px)`,
                borderRadius: "12px",
                width: `calc(100% - ${buttonRadiusOffset}px)`,
                height: `calc(100% - ${buttonRadiusOffset}px)`,
              },
            },
          },
        },
      ],
    },
  },
});

export default getDesignTokens;
