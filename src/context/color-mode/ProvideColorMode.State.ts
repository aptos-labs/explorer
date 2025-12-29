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

  // Memoize toggleColorMode to ensure stable reference
  const toggleColorMode = useMemo(
    () => () => {
      setMode((prevMode) => {
        if (prevMode === "light") {
          localStorage.setItem("color_scheme", "dark");
          return "dark";
        } else {
          localStorage.setItem("color_scheme", "light");
          return "light";
        }
      });
    },
    [], // Empty deps - setMode is stable from useState
  );

  // Memoize theme creation to prevent unnecessary re-renders
  const theme = useMemo(() => {
    const baseTheme = responsiveFontSizes(createTheme(getDesignTokens(mode)));
    return createTheme(baseTheme, {
      typography: {
        h1: {
          fontSize: "2.5rem",
          [baseTheme.breakpoints.up("sm")]: {
            fontSize: "2.5rem",
          },
          [baseTheme.breakpoints.up("md")]: {
            fontSize: "3rem",
          },
          [baseTheme.breakpoints.up("lg")]: {
            fontSize: "3.5rem",
          },
        },
      },
    });
  }, [mode]);

  return {toggleColorMode, theme};
};

export default useProvideColorMode;
