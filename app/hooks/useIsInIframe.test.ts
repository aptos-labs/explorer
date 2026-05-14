// Covers FEAT-PWA-002 — Iframe detection for share button surfacing
//
// Tests target the pure `detectIsInIframe` helper so we don't have to mutate
// `window.top` (jsdom exposes it as an unforgeable / non-configurable
// accessor in some versions). The React hook is a one-line wrapper around
// the helper plus `useState` / `useEffect`, so covering the helper is
// sufficient for the detection branches.
import {describe, expect, it} from "vitest";
import {detectIsInIframe} from "./useIsInIframe";

describe("FEAT-PWA-002 — detectIsInIframe", () => {
  it("returns false when no window is provided (SSR fallback)", () => {
    expect(detectIsInIframe(undefined)).toBe(false);
  });

  it("returns false when window.self === window.top (top-level browsing context)", () => {
    const win = {} as Window;
    // biome-ignore lint/suspicious/noExplicitAny: stubbing window self/top for test
    (win as any).self = win;
    // biome-ignore lint/suspicious/noExplicitAny: stubbing window self/top for test
    (win as any).top = win;
    expect(detectIsInIframe(win)).toBe(false);
  });

  it("returns true when window.self !== window.top (same-origin iframe)", () => {
    const fakeTop = {} as Window;
    const win = {} as Window;
    // biome-ignore lint/suspicious/noExplicitAny: stubbing window self/top for test
    (win as any).self = win;
    // biome-ignore lint/suspicious/noExplicitAny: stubbing window self/top for test
    (win as any).top = fakeTop;
    expect(detectIsInIframe(win)).toBe(true);
  });

  it("returns true when accessing window.top throws (cross-origin iframe)", () => {
    const win = {} as Window;
    Object.defineProperty(win, "self", {
      configurable: true,
      get: () => win,
    });
    Object.defineProperty(win, "top", {
      configurable: true,
      get: () => {
        throw new Error("SecurityError: cross-origin frame");
      },
    });
    expect(detectIsInIframe(win)).toBe(true);
  });
});
