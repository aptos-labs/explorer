import {afterEach, describe, expect, it, vi} from "vitest";
import {emitRateLimit, onRateLimit} from "./rateLimitEvents";

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
