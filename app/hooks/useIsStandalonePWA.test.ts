// @vitest-environment jsdom
// Covers FEAT-PWA-002 — Standalone PWA detection
import {act, renderHook} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {useIsStandalonePWA} from "./useIsStandalonePWA";

type MqlListener = (event: MediaQueryListEvent) => void;

interface FakeMql {
  matches: boolean;
  media: string;
  listeners: MqlListener[];
  addEventListener: (type: string, cb: MqlListener) => void;
  removeEventListener: (type: string, cb: MqlListener) => void;
  addListener: (cb: MqlListener) => void;
  removeListener: (cb: MqlListener) => void;
  fire: () => void;
}

function makeMql(media: string, matches: boolean): FakeMql {
  const mql: FakeMql = {
    matches,
    media,
    listeners: [],
    addEventListener(_type, cb) {
      mql.listeners.push(cb);
    },
    removeEventListener(_type, cb) {
      mql.listeners = mql.listeners.filter((fn) => fn !== cb);
    },
    addListener(cb) {
      mql.listeners.push(cb);
    },
    removeListener(cb) {
      mql.listeners = mql.listeners.filter((fn) => fn !== cb);
    },
    fire() {
      for (const cb of [...mql.listeners]) {
        cb({matches: mql.matches, media: mql.media} as MediaQueryListEvent);
      }
    },
  };
  return mql;
}

function installMatchMedia(map: Record<string, FakeMql>) {
  const mm = vi.fn((query: string) => {
    const existing = map[query];
    if (existing) return existing;
    const created = makeMql(query, false);
    map[query] = created;
    return created;
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: mm,
  });
  return mm;
}

afterEach(() => {
  // Reset between tests.
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: undefined,
  });
  delete (window.navigator as Navigator & {standalone?: boolean}).standalone;
});

describe("FEAT-PWA-002 — useIsStandalonePWA", () => {
  it("returns false when running in a regular browser tab", () => {
    installMatchMedia({
      "(display-mode: standalone)": makeMql(
        "(display-mode: standalone)",
        false,
      ),
      "(display-mode: window-controls-overlay)": makeMql(
        "(display-mode: window-controls-overlay)",
        false,
      ),
    });
    const {result} = renderHook(() => useIsStandalonePWA());
    expect(result.current).toBe(false);
  });

  it("returns true for display-mode: standalone (Android/Chromium PWA)", () => {
    installMatchMedia({
      "(display-mode: standalone)": makeMql("(display-mode: standalone)", true),
      "(display-mode: window-controls-overlay)": makeMql(
        "(display-mode: window-controls-overlay)",
        false,
      ),
    });
    const {result} = renderHook(() => useIsStandalonePWA());
    expect(result.current).toBe(true);
  });

  it("returns true for display-mode: window-controls-overlay (desktop PWA)", () => {
    installMatchMedia({
      "(display-mode: standalone)": makeMql(
        "(display-mode: standalone)",
        false,
      ),
      "(display-mode: window-controls-overlay)": makeMql(
        "(display-mode: window-controls-overlay)",
        true,
      ),
    });
    const {result} = renderHook(() => useIsStandalonePWA());
    expect(result.current).toBe(true);
  });

  it("returns true for legacy iOS Safari navigator.standalone", () => {
    installMatchMedia({
      "(display-mode: standalone)": makeMql(
        "(display-mode: standalone)",
        false,
      ),
      "(display-mode: window-controls-overlay)": makeMql(
        "(display-mode: window-controls-overlay)",
        false,
      ),
    });
    Object.defineProperty(window.navigator, "standalone", {
      configurable: true,
      writable: true,
      value: true,
    });
    const {result} = renderHook(() => useIsStandalonePWA());
    expect(result.current).toBe(true);
  });

  it("updates when display-mode flips at runtime", () => {
    const standaloneMql = makeMql("(display-mode: standalone)", false);
    installMatchMedia({
      "(display-mode: standalone)": standaloneMql,
      "(display-mode: window-controls-overlay)": makeMql(
        "(display-mode: window-controls-overlay)",
        false,
      ),
    });
    const {result} = renderHook(() => useIsStandalonePWA());
    expect(result.current).toBe(false);

    act(() => {
      standaloneMql.matches = true;
      standaloneMql.fire();
    });
    expect(result.current).toBe(true);
  });
});
