// Covers FEAT-RATELIMIT-002 — Client-side rate limit detection and URL parsing
import {describe, expect, it} from "vitest";
import {getEndpointFromUrl, isRateLimitError} from "./rateLimiter";

describe("FEAT-RATELIMIT-002 — isRateLimitError", () => {
  it("detects HTTP 429 status", () => {
    expect(isRateLimitError({status: 429})).toBe(true);
  });

  it("detects ResponseError type 'Too Many Requests'", () => {
    expect(isRateLimitError({type: "Too Many Requests"})).toBe(true);
  });

  it("detects 'rate limit' in error message", () => {
    expect(isRateLimitError({message: "You hit the rate limit"})).toBe(true);
  });

  it("detects 'too many requests' in error message", () => {
    expect(
      isRateLimitError({message: "Too Many Requests - try again later"}),
    ).toBe(true);
  });

  it("returns false for 404", () => {
    expect(isRateLimitError({status: 404})).toBe(false);
  });

  it("returns false for null", () => {
    expect(isRateLimitError(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isRateLimitError(undefined)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isRateLimitError("error")).toBe(false);
    expect(isRateLimitError(42)).toBe(false);
  });

  it("returns false for unrelated error object", () => {
    expect(isRateLimitError({status: 500, message: "Server error"})).toBe(
      false,
    );
  });
});

describe("FEAT-RATELIMIT-002 — getEndpointFromUrl", () => {
  it("extracts hostname from full URL", () => {
    expect(
      getEndpointFromUrl("https://fullnode.mainnet.aptoslabs.com/v1/accounts"),
    ).toBe("fullnode.mainnet.aptoslabs.com");
  });

  it("extracts hostname from URL with port", () => {
    expect(getEndpointFromUrl("http://127.0.0.1:8080/v1")).toBe("127.0.0.1");
  });

  it("returns raw string for invalid URL", () => {
    expect(getEndpointFromUrl("not-a-url")).toBe("not-a-url");
  });

  it("returns raw string for empty string", () => {
    expect(getEndpointFromUrl("")).toBe("");
  });
});
