import {useMemo, useState} from "react";
import {createTheme, responsiveFontSizes} from "@mui/material";
import getDesignTokens from "../../themes/theme";
import useMediaQuery from "@mui/material/useMediaQuery";

export interface ColorModeContext {
  toggleColorMode: () => void;
}

type Mode = "light" | "dark" | "system";

const useProvideColorMode = () => {
  const systemColorScheme = useMediaQuery("(prefers-color-scheme: dark)")
    ? "dark"
    : "light";

  const [mode, setMode] = useState<Mode>(() => {
    const storedMode = localStorage.getItem("color_scheme") as Mode;
    return storedMode === "light" || storedMode === "dark"
      ? storedMode
      : "system";
  });

  const toggleColorMode = () => {
    setMode((prevMode) => {
      if (prevMode === "light") {
        localStorage.setItem("color_scheme", "dark");
        return "dark";
      } else if (prevMode === "dark") {
        localStorage.setItem("color_scheme", "light");
        return "light";
      } else {
        localStorage.removeItem("color_scheme");
        return systemColorScheme;
      }
    });
  };

  let theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme(
          getDesignTokens(mode === "system" ? systemColorScheme : mode),
        ),
      ),
    [mode, systemColorScheme],
  );

  theme = createTheme(theme, {
    typography: {
      h1: {
        fontSize: "2.5rem",
        [theme.breakpoints.up("sm")]: {
          fontSize: "2.5rem",
        },
        [theme.breakpoints.up("md")]: {
          fontSize: "3rem",
        },
        [theme.breakpoints.up("lg")]: {
          fontSize: "3.5rem",
        },
      },
    },
  });

  return {toggleColorMode, theme};
};

export default useProvideColorMode;
