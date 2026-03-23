import {afterEach, describe, expect, it, vi} from "vitest";
import {emitRateLimit, isRateLimitLike, onRateLimit} from "./rateLimitEvents";

describe("rateLimitEvents", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls registered listener when rate limit is emitted", () => {
    const listener = vi.fn();
    const unsubscribe = onRateLimit(listener);

    emitRateLimit();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("does not call listener after unsubscribing", () => {
    const listener = vi.fn();
    const unsubscribe = onRateLimit(listener);

    unsubscribe();
    emitRateLimit();

    expect(listener).not.toHaveBeenCalled();
  });

  it("supports multiple listeners", () => {
    const a = vi.fn();
    const b = vi.fn();

    const unsubA = onRateLimit(a);
    const unsubB = onRateLimit(b);

    emitRateLimit();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);

    unsubA();
    emitRateLimit();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(2);

    unsubB();
  });
});

describe("isRateLimitLike", () => {
  it("detects ResponseError shape", () => {
    expect(isRateLimitLike({type: "Too Many Requests"})).toBe(true);
  });

  it("detects object with status 429 (AptosApiError)", () => {
    expect(isRateLimitLike({status: 429, message: "rate limited"})).toBe(true);
  });

  it("detects Error with 'too many requests' message", () => {
    expect(isRateLimitLike(new Error("Too Many Requests"))).toBe(true);
  });

  it("detects Error with '429' in message", () => {
    expect(isRateLimitLike(new Error("Request failed with status 429"))).toBe(
      true,
    );
  });

  it("returns false for null/undefined", () => {
    expect(isRateLimitLike(null)).toBe(false);
    expect(isRateLimitLike(undefined)).toBe(false);
  });

  it("returns false for 404 errors", () => {
    expect(isRateLimitLike({type: "Not Found"})).toBe(false);
    expect(isRateLimitLike({status: 404})).toBe(false);
  });

  it("returns false for generic errors", () => {
    expect(isRateLimitLike(new Error("Network error"))).toBe(false);
  });
});
