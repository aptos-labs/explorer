// Covers FEAT-RATELIMIT-003 — legacy REST `withResponseError` treats HTML/CDN 429 bodies as rate limits
import {afterEach, describe, expect, it, vi} from "vitest";
import {emitRateLimit} from "../context/rate-limit/rateLimitEvents";
import {withResponseError} from "./index";

vi.mock("../context/rate-limit/rateLimitEvents", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../context/rate-limit/rateLimitEvents")
    >();
  return {
    ...actual,
    emitRateLimit: vi.fn(),
  };
});

describe("withResponseError (legacy app/api/index)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("emits rate limit when error message includes 429 (HTML edge/CDN body)", async () => {
    const html429 = new Error(
      "Aptos API error 429: <!doctype html><title>429</title>Too Many Requests",
    );
    await expect(withResponseError(Promise.reject(html429))).rejects.toThrow(
      /Request failed:/,
    );
    expect(emitRateLimit).toHaveBeenCalledTimes(1);
    expect(emitRateLimit).toHaveBeenCalledWith(html429);
  });
});
