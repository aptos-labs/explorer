import {createTheme, responsiveFontSizes} from "@mui/material";
import Cookies from "js-cookie";
import {useCallback, useEffect, useMemo, useState} from "react";
import getDesignTokens from "../../themes/theme";

export interface ColorModeContext {
  toggleColorMode: () => void;
}

type Mode = "light" | "dark";

const COLOR_MODE_COOKIE = "color_scheme";
const SSR_DEFAULT_MODE: Mode = "dark";

/**
 * SSR-compatible color mode hook.
 *
 * SSR cannot read the user's cookie, so the server always renders with
 * {@link SSR_DEFAULT_MODE}. To avoid a hydration mismatch — which would leave
 * MUI styled components stuck on the server-rendered (dark) class names even
 * after the React tree re-renders with a different mode — the initial client
 * render also uses {@link SSR_DEFAULT_MODE}. After hydration we read the
 * cookie / system preference and `setMode` if it differs. This produces a
 * brief flash of dark mode for light-mode users, but it is the only way to
 * keep the className attributes correct without server-side cookie awareness.
 *
 * Long-term: switching the theme to `palette: { cssVariables: true }` + an
 * inline color-scheme script would eliminate the flash entirely.
 */
const useProvideColorMode = () => {
  const [mode, setMode] = useState<Mode>(SSR_DEFAULT_MODE);

  // Track hydration so the media-query listener is only attached client-side
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync to the user's preferred mode after hydration. Done in an effect
  // (not a useState initializer) so that the first client render matches
  // the SSR HTML — otherwise MUI styled components keep the server's class
  // names and the page renders with a mixed light/dark palette.
  //
  // Defer via a microtask so the hydration commit fully settles before we
  // trigger the mode-switching re-render. React 19 explicitly refuses to
  // "patch up" attribute mismatches detected during hydration, so the
  // mode-switching render has to happen after hydration has finished.
  useEffect(() => {
    setIsHydrated(true);

    const target: Mode = (() => {
      const savedMode = Cookies.get(COLOR_MODE_COOKIE) as Mode | null;
      if (savedMode === "dark" || savedMode === "light") {
        return savedMode;
      }
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const systemMode: Mode = prefersDark ? "dark" : "light";
      Cookies.set(COLOR_MODE_COOKIE, systemMode, {
        expires: 365,
        sameSite: "lax",
        secure: window.location.protocol === "https:",
      });
      return systemMode;
    })();

    // Schedule the state update outside the current commit so React treats
    // it as a normal client-side update and properly patches the styled
    // component className attributes after hydration. setMode is a no-op
    // when target === current mode.
    const id = window.setTimeout(() => {
      setMode((prev) => (prev === target ? prev : target));
    }, 0);
    return () => {
      window.clearTimeout(id);
    };
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
