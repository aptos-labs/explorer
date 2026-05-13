import {useEffect, useState} from "react";

const STANDALONE_QUERY = "(display-mode: standalone)";

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
 * `matchMedia.change` so toggling between browser tab and installed app
 * (rare, but possible on desktop) updates the result.
 */
export function useIsStandalonePWA(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const compute = () => {
      const standaloneByMedia =
        typeof window.matchMedia === "function" &&
        (window.matchMedia(STANDALONE_QUERY).matches ||
          window.matchMedia("(display-mode: window-controls-overlay)").matches);
      const standaloneByIos =
        (window.navigator as Navigator & {standalone?: boolean}).standalone ===
        true;
      setIsStandalone(Boolean(standaloneByMedia || standaloneByIos));
    };

    compute();

    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(STANDALONE_QUERY);
    const listener = () => compute();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
    // Older Safari fallback.
    mql.addListener(listener);
    return () => mql.removeListener(listener);
  }, []);

  return isStandalone;
}
