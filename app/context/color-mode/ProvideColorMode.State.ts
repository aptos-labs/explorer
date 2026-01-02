import {useMemo, useState, useEffect, useCallback} from "react";
import {createTheme, responsiveFontSizes} from "@mui/material";
import getDesignTokens from "../../themes/theme";
import Cookies from "js-cookie";

export interface ColorModeContext {
  toggleColorMode: () => void;
}

type Mode = "light" | "dark";

const COLOR_MODE_COOKIE = "color_scheme";

/**
 * SSR-compatible color mode hook
 * Uses cookies instead of localStorage for SSR compatibility
 */
const useProvideColorMode = () => {
  // Initialize from cookie or default to light (avoids hydration mismatch)
  const [mode, setMode] = useState<Mode>(() => {
    // During SSR, we can't access cookies directly in useState initializer
    // So we default to "light" and update in useEffect
    if (typeof window === "undefined") {
      return "light";
    }
    const savedMode = Cookies.get(COLOR_MODE_COOKIE) as Mode | null;
    return savedMode === "dark" || savedMode === "light" ? savedMode : "light";
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and system preference
  useEffect(() => {
    setIsHydrated(true);

    // Check for saved preference in cookie first
    const savedMode = Cookies.get(COLOR_MODE_COOKIE) as Mode | null;
    if (savedMode === "dark" || savedMode === "light") {
      setMode(savedMode);
      return;
    }

    // Fall back to system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const systemMode = prefersDark ? "dark" : "light";
    setMode(systemMode);
    Cookies.set(COLOR_MODE_COOKIE, systemMode, {expires: 365, sameSite: "lax"});
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (!isHydrated) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const savedMode = Cookies.get(COLOR_MODE_COOKIE);
      if (!savedMode) {
        const newMode = e.matches ? "dark" : "light";
        setMode(newMode);
        Cookies.set(COLOR_MODE_COOKIE, newMode, {
          expires: 365,
          sameSite: "lax",
        });
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [isHydrated]);

  // Memoize toggleColorMode to ensure stable reference
  const toggleColorMode = useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      Cookies.set(COLOR_MODE_COOKIE, newMode, {expires: 365, sameSite: "lax"});
      return newMode;
    });
  }, []);

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
