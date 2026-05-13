import {useEffect, useState} from "react";

const DISPLAY_MODE_QUERIES = [
  "(display-mode: standalone)",
  "(display-mode: window-controls-overlay)",
] as const;

/**
 * Returns true when the explorer is running in PWA "standalone" mode —
 * i.e. installed to the home screen / app launcher and opened without the
 * browser chrome. Detects:
 *
 * - `display-mode: standalone` (Android Chrome, desktop Chromium, Edge, etc.)
 * - `display-mode: window-controls-overlay` (desktop PWAs with WCO)
 * - Legacy iOS Safari `navigator.standalone`
 *
 * SSR-safe: returns `false` on the server and during the first client render,
 * then re-renders with the real value once mounted. Subscribes to
 * `matchMedia.change` on **every** tracked display-mode query so that toggling
 * either standalone or window-controls-overlay at runtime updates the result.
 */
export function useIsStandalonePWA(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.matchMedia !== "function") {
      const standaloneByIos =
        (window.navigator as Navigator & {standalone?: boolean}).standalone ===
        true;
      setIsStandalone(standaloneByIos);
      return;
    }

    const mqls = DISPLAY_MODE_QUERIES.map((q) => window.matchMedia(q));

    const compute = () => {
      const standaloneByMedia = mqls.some((mql) => mql.matches);
      const standaloneByIos =
        (window.navigator as Navigator & {standalone?: boolean}).standalone ===
        true;
      setIsStandalone(standaloneByMedia || standaloneByIos);
    };

    compute();

    const listener = () => compute();
    const cleanups = mqls.map((mql) => {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", listener);
        return () => mql.removeEventListener("change", listener);
      }
      // Older Safari fallback.
      mql.addListener(listener);
      return () => mql.removeListener(listener);
    });
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return isStandalone;
}
