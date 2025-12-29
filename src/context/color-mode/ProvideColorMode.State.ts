import {useMemo, useState, useEffect} from "react";
import {createTheme, responsiveFontSizes} from "@mui/material";
import getDesignTokens from "../../themes/theme";
import useMediaQuery from "@mui/material/useMediaQuery";

export interface ColorModeContext {
  toggleColorMode: () => void;
}

type Mode = "light" | "dark";

const useProvideColorMode = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)", {
    noSsr: true,
  })
    ? "dark"
    : "light";

  // Initialize mode directly instead of using useLayoutEffect
  const [mode, setMode] = useState<Mode>(() => {
    const savedMode = localStorage.getItem("color_scheme") as Mode | null;
    return savedMode !== null ? savedMode : prefersDarkMode;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setMode(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      if (prevMode === "light") {
        localStorage.setItem("color_scheme", "dark");
        return "dark";
      } else {
        localStorage.setItem("color_scheme", "light");
        return "light";
      }
    });
  };

  let theme = useMemo(
    () => responsiveFontSizes(createTheme(getDesignTokens(mode))),
    [mode],
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
