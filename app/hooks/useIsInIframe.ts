import {useEffect, useState} from "react";

/**
 * Returns true when the explorer is running inside an iframe (cross- or
 * same-origin embedding). Like an installed PWA, an iframe typically hides
 * the browser address bar / share menu, so surfacing in-app share controls
 * is helpful for users embedded in another site or app shell.
 *
 * SSR-safe: returns `false` on the server and during the first client render,
 * then re-renders with the real value once mounted.
 *
 * Detection strategy: compare `window.self` with `window.top`. Cross-origin
 * iframes throw on `window.top` access in some browsers — that throw is
 * itself a signal we are framed, so we treat it as `true`.
 */
export function useIsInIframe(): boolean {
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setIsFramed(window.self !== window.top);
    } catch {
      setIsFramed(true);
    }
  }, []);

  return isFramed;
}
