import {useEffect, useState} from "react";

/**
 * Pure detector for "is this script running inside an iframe?". Extracted
 * from the React hook so the logic is unit-testable without poking at
 * `window.top` (which jsdom historically exposes as a non-configurable
 * accessor — `Object.defineProperty(window, "top", ...)` is fragile across
 * jsdom releases). Tests inject a stub `Window` instead.
 *
 * Cross-origin iframes throw on `top` access in some browsers (the parent
 * `Window` lives in another agent cluster); that throw is itself a signal
 * we are framed, so we treat it as `true`.
 */
export function detectIsInIframe(win: Window | undefined): boolean {
  if (!win) return false;
  try {
    return win.self !== win.top;
  } catch {
    return true;
  }
}

/**
 * Returns true when the explorer is running inside an iframe (cross- or
 * same-origin embedding). Like an installed PWA, an iframe typically hides
 * the browser address bar / share menu, so surfacing in-app share controls
 * is helpful for users embedded in another site or app shell.
 *
 * SSR-safe: returns `false` on the server and during the first client render,
 * then re-renders with the real value once mounted.
 */
export function useIsInIframe(): boolean {
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsFramed(detectIsInIframe(window));
  }, []);

  return isFramed;
}
