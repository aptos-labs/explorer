import {afterEach, describe, expect, it, vi} from "vitest";
import {emitRateLimit} from "../context/rate-limit/rateLimitEvents";
import {
  isNotFoundError,
  ResponseErrorType,
  toResponseError,
  withResponseError,
} from "./client";

vi.mock("../context/rate-limit/rateLimitEvents", () => ({
  emitRateLimit: vi.fn(),
}));

describe("withResponseError", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("emits rate limit event on 429 status", async () => {
    const error = {status: 429, statusText: "Too Many Requests"};
    await expect(withResponseError(Promise.reject(error))).rejects.toEqual({
      type: ResponseErrorType.TOO_MANY_REQUESTS,
    });
    expect(emitRateLimit).toHaveBeenCalledTimes(1);
  });

  it("emits rate limit event on Error with 'too many requests' message", async () => {
    const error = new Error("Too Many Requests");
    await expect(withResponseError(Promise.reject(error))).rejects.toEqual({
      type: ResponseErrorType.TOO_MANY_REQUESTS,
    });
    expect(emitRateLimit).toHaveBeenCalledTimes(1);
  });

  it("does not emit on 404", async () => {
    const error = {status: 404, statusText: "Not Found"};
    await expect(withResponseError(Promise.reject(error))).rejects.toEqual({
      type: ResponseErrorType.NOT_FOUND,
    });
    expect(emitRateLimit).not.toHaveBeenCalled();
  });

  it("does not emit on generic errors", async () => {
    const error = new Error("Network error");
    await expect(withResponseError(Promise.reject(error))).rejects.toEqual({
      type: ResponseErrorType.UNHANDLED,
      message: "Network error",
    });
    expect(emitRateLimit).not.toHaveBeenCalled();
  });

  it("resolves successfully for non-error promises", async () => {
    const result = await withResponseError(Promise.resolve("data"));
    expect(result).toBe("data");
    expect(emitRateLimit).not.toHaveBeenCalled();
  });
});

describe("isNotFoundError", () => {
  it("matches typed NOT_FOUND errors", () => {
    expect(isNotFoundError({type: ResponseErrorType.NOT_FOUND})).toBe(true);
  });

  it("matches HTTP 404 status objects", () => {
    expect(isNotFoundError({status: 404})).toBe(true);
  });

  it("matches legacy Aptos API 404 Error messages", () => {
    expect(isNotFoundError(new Error("Aptos API error 404: missing"))).toBe(
      true,
    );
  });

  it("does not match unrelated failures", () => {
    expect(isNotFoundError({type: ResponseErrorType.UNHANDLED})).toBe(false);
    expect(isNotFoundError(new Error("Network error"))).toBe(false);
  });
});

describe("toResponseError", () => {
  it("preserves typed ResponseError values", () => {
    const err = {
      type: ResponseErrorType.TOO_MANY_REQUESTS,
      message: "slow down",
    };
    expect(toResponseError(err)).toEqual(err);
  });

  it("maps 404-shaped errors to NOT_FOUND", () => {
    expect(toResponseError(new Error("Aptos API error 404: x"))).toEqual({
      type: ResponseErrorType.NOT_FOUND,
      message: "Aptos API error 404: x",
    });
  });
});
