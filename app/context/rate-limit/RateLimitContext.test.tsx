// @vitest-environment jsdom
import {act, renderHook} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {RateLimitProvider, useRateLimit} from "./RateLimitContext";
import {emitRateLimit} from "./rateLimitEvents";
import {emitApiKeySaved} from "./settingsEvents";

function wrapper({children}: {children: ReactNode}) {
  return <RateLimitProvider>{children}</RateLimitProvider>;
}

describe("RateLimitContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with isRateLimited=false", () => {
    const {result} = renderHook(() => useRateLimit(), {wrapper});
    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.rateLimitedAt).toBeNull();
  });

  it("sets isRateLimited=true when emitRateLimit fires", () => {
    const {result} = renderHook(() => useRateLimit(), {wrapper});

    act(() => {
      emitRateLimit();
    });

    expect(result.current.isRateLimited).toBe(true);
    expect(result.current.rateLimitedAt).toBeTypeOf("number");
  });

  it("resets after 5 minutes", () => {
    const {result} = renderHook(() => useRateLimit(), {wrapper});

    act(() => {
      emitRateLimit();
    });
    expect(result.current.isRateLimited).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.rateLimitedAt).toBeNull();
  });

  it("dismisses when dismissRateLimit is called", () => {
    const {result} = renderHook(() => useRateLimit(), {wrapper});

    act(() => {
      emitRateLimit();
    });
    expect(result.current.isRateLimited).toBe(true);

    act(() => {
      result.current.dismissRateLimit();
    });
    expect(result.current.isRateLimited).toBe(false);
  });

  it("re-shows after dismiss if a new 429 arrives", () => {
    const {result} = renderHook(() => useRateLimit(), {wrapper});

    act(() => {
      emitRateLimit();
    });
    act(() => {
      result.current.dismissRateLimit();
    });
    expect(result.current.isRateLimited).toBe(false);

    act(() => {
      emitRateLimit();
    });
    expect(result.current.isRateLimited).toBe(true);
  });

  it("clears rate-limit state when API key is saved", () => {
    const {result} = renderHook(() => useRateLimit(), {wrapper});

    act(() => {
      emitRateLimit();
    });
    expect(result.current.isRateLimited).toBe(true);

    act(() => {
      emitApiKeySaved();
    });
    expect(result.current.isRateLimited).toBe(false);
    expect(result.current.rateLimitedAt).toBeNull();
  });

  it("suppresses 429 events during grace period after API key save", () => {
    const {result} = renderHook(() => useRateLimit(), {wrapper});

    act(() => {
      emitApiKeySaved();
    });

    act(() => {
      emitRateLimit();
    });
    expect(result.current.isRateLimited).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    act(() => {
      emitRateLimit();
    });
    expect(result.current.isRateLimited).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5_001);
    });
    act(() => {
      emitRateLimit();
    });
    expect(result.current.isRateLimited).toBe(true);
  });
});
