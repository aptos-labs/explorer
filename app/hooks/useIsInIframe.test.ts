// @vitest-environment jsdom
// Covers FEAT-PWA-002 — Iframe detection for share button surfacing
import {renderHook} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";
import {useIsInIframe} from "./useIsInIframe";

const originalDescriptor = Object.getOwnPropertyDescriptor(window, "top");

afterEach(() => {
  if (originalDescriptor) {
    Object.defineProperty(window, "top", originalDescriptor);
  } else {
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => window,
    });
  }
});

describe("FEAT-PWA-002 — useIsInIframe", () => {
  it("returns false when window.self === window.top (top-level browsing context)", () => {
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => window,
    });
    const {result} = renderHook(() => useIsInIframe());
    expect(result.current).toBe(false);
  });

  it("returns true when window.self !== window.top (same-origin iframe)", () => {
    const fakeTop = {} as Window;
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => fakeTop,
    });
    const {result} = renderHook(() => useIsInIframe());
    expect(result.current).toBe(true);
  });

  it("returns true when accessing window.top throws (cross-origin iframe)", () => {
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => {
        throw new Error("SecurityError: cross-origin frame");
      },
    });
    const {result} = renderHook(() => useIsInIframe());
    expect(result.current).toBe(true);
  });
});
