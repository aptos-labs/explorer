import {createTheme, responsiveFontSizes} from "@mui/material";
import {createIsomorphicFn} from "@tanstack/react-start";
import {getCookie as getRequestCookie} from "@tanstack/react-start/server";
import Cookies from "js-cookie";
import {useCallback, useEffect, useMemo, useState} from "react";
import getDesignTokens from "../../themes/theme";

export interface ColorModeContext {
  toggleColorMode: () => void;
}

type Mode = "light" | "dark";

const COLOR_MODE_COOKIE = "color_scheme";
const FALLBACK_MODE: Mode = "dark";

function parseMode(value: string | undefined): Mode | null {
  return value === "dark" || value === "light" ? value : null;
}

/**
 * Resolve the initial color-mode synchronously on both the server and the
 * first client render. Reading the cookie at this exact moment is what keeps
 * SSR and hydration in lock-step — see the long comment in
 * {@link useProvideColorMode} for why that matters under MUI v9 + React 19.
 *
 * The SSR implementation reads the request cookie via TanStack Start; the
 * client implementation reads `document.cookie`. They must agree.
 */
const getInitialColorMode = createIsomorphicFn()
  .server((): Mode => {
    try {
      return parseMode(getRequestCookie(COLOR_MODE_COOKIE)) ?? FALLBACK_MODE;
    } catch {
      return FALLBACK_MODE;
    }
  })
  .client((): Mode => {
    if (typeof document === "undefined") return FALLBACK_MODE;
    return parseMode(Cookies.get(COLOR_MODE_COOKIE)) ?? FALLBACK_MODE;
  });

/**
 * SSR-compatible color mode hook.
 *
 * Both the SSR render and the first client render derive `mode` from the
 * `color_scheme` cookie via {@link getInitialColorMode}, so they agree.
 * Reading the cookie via a `useState` initializer instead of a post-mount
 * `useEffect` is critical: under MUI v9 + React 19, a hydration mismatch
 * would leave styled-component class names stuck on the server-rendered
 * values (React 19 logs "this won't be patched up"), producing the
 * black-on-black header/banner regression that #1633 originally introduced.
 *
 * Users who have never set a preference fall through to {@link FALLBACK_MODE}
 * for the first render, then sync to their system preference (and persist
 * a cookie) in the post-mount effect below. That sync runs deferred so
 * React treats it as a normal client-side update, not a hydration patch.
 */
const useProvideColorMode = () => {
  const [mode, setMode] = useState<Mode>(() => getInitialColorMode());

  // Track hydration so the media-query listener is only attached client-side
  const [isHydrated, setIsHydrated] = useState(false);

  // If the cookie was missing during the initial render we fell back to
  // FALLBACK_MODE; once the client is mounted we can consult
  // prefers-color-scheme and persist the result so subsequent visits skip
  // the flash entirely.
  useEffect(() => {
    setIsHydrated(true);

    if (Cookies.get(COLOR_MODE_COOKIE)) return; // already have a preference

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const systemMode: Mode = prefersDark ? "dark" : "light";
    Cookies.set(COLOR_MODE_COOKIE, systemMode, {
      expires: 365,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });

    // Defer so React applies this as an ordinary post-hydration update;
    // attribute patching only works correctly outside the hydration commit.
    const id = window.setTimeout(() => {
      setMode((prev) => (prev === systemMode ? prev : systemMode));
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
