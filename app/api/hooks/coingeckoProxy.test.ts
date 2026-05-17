// @vitest-environment jsdom
import Cookies from "js-cookie";
import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {
  resolveCoingeckoUrl,
  shouldUseCoingeckoProxy,
} from "./coingeckoProxy";

const FLAG_COOKIE = "use_coingecko_proxy";

function setCookie(value: string) {
  Cookies.set(FLAG_COOKIE, value);
}

function clearCookie() {
  Cookies.remove(FLAG_COOKIE);
}

describe("shouldUseCoingeckoProxy / resolveCoingeckoUrl", () => {
  beforeEach(() => {
    clearCookie();
  });

  afterEach(() => {
    clearCookie();
  });

  it("uses the proxy when the cookie is exactly 'true'", () => {
    setCookie("true");
    expect(shouldUseCoingeckoProxy()).toBe(true);
    expect(
      resolveCoingeckoUrl("price", "/simple/price", "ids=aptos"),
    ).toBe("/api/coingecko/price?ids=aptos");
  });

  it("uses the direct upstream when the cookie is exactly 'false'", () => {
    setCookie("false");
    expect(shouldUseCoingeckoProxy()).toBe(false);
    expect(
      resolveCoingeckoUrl("price", "/simple/price", "ids=aptos"),
    ).toBe("https://api.coingecko.com/api/v3/simple/price?ids=aptos");
  });

  it("ignores unrelated cookie values and falls back to env / default", () => {
    setCookie("maybe");
    // No production env in tests, so default is `false` (direct).
    expect(shouldUseCoingeckoProxy()).toBe(false);
  });

  it("handles an empty query string", () => {
    setCookie("true");
    expect(resolveCoingeckoUrl("markets", "/coins/markets", "")).toBe(
      "/api/coingecko/markets",
    );
    setCookie("false");
    expect(resolveCoingeckoUrl("markets", "/coins/markets", "")).toBe(
      "https://api.coingecko.com/api/v3/coins/markets",
    );
  });

  it("accepts a query string with or without leading '?'", () => {
    setCookie("true");
    expect(
      resolveCoingeckoUrl("price", "/simple/price", "?ids=aptos"),
    ).toBe("/api/coingecko/price?ids=aptos");
    expect(
      resolveCoingeckoUrl("price", "/simple/price", "ids=aptos"),
    ).toBe("/api/coingecko/price?ids=aptos");
  });
});
