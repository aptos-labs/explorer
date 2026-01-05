import {useMemo, useState, useEffect, useCallback, useRef} from "react";
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
  // Initialize from cookie, system preference, or default to dark
  const [mode, setMode] = useState<Mode>(() => {
    // During SSR, default to dark (will be overridden on client)
    if (typeof window === "undefined") {
      return "dark";
    }
    // Check cookie first
    const savedMode = Cookies.get(COLOR_MODE_COOKIE) as Mode | null;
    if (savedMode === "dark" || savedMode === "light") {
      return savedMode;
    }
    // No cookie - check system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const systemMode = prefersDark ? "dark" : "light";
    // Persist system preference to cookie for SSR consistency
    Cookies.set(COLOR_MODE_COOKIE, systemMode, {
      expires: 365,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });
    return systemMode;
  });

  // Track hydration with a ref for system preference listener
  const isHydrated = useRef(false);

  // Mark as hydrated after first render
  useEffect(() => {
    isHydrated.current = true;
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    if (!isHydrated.current) return;

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
          secure: window.location.protocol === "https:",
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
      Cookies.set(COLOR_MODE_COOKIE, newMode, {
        expires: 365,
        sameSite: "lax",
        secure: window.location.protocol === "https:",
      });
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
