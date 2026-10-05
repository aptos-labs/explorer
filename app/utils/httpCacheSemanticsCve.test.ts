// Covers CVE-2026-93748 / GHSA-ch52-4w7c-c8xp — shared-cache max-stale reuse
import {readdirSync} from "node:fs";
import {createRequire} from "node:module";
import {join} from "node:path";
import {describe, expect, it} from "vitest";

type HeaderMap = Record<string, string>;

type CachePolicyInstance = {
  maxAge: () => number;
  timeToLive: () => number;
  satisfiesWithoutRevalidation: (req: {
    url?: string;
    headers: HeaderMap;
  }) => boolean;
  useStaleWhileRevalidate: () => boolean;
  revalidatedPolicy: (
    req: {url?: string; headers: HeaderMap},
    res: {status?: number; headers: HeaderMap},
  ) => {modified: boolean};
};

type CachePolicyCtor = new (
  req: {url?: string; headers: HeaderMap},
  res: {status?: number; headers: HeaderMap},
  options?: {shared?: boolean},
) => CachePolicyInstance;

function loadCachePolicy(): CachePolicyCtor {
  const store = join(process.cwd(), "node_modules/.pnpm");
  const entry = readdirSync(store).find(
    (name) =>
      name.startsWith("http-cache-semantics@4.2.0") &&
      name.includes("patch_hash="),
  );
  if (!entry) {
    throw new Error(
      "patched http-cache-semantics@4.2.0 is not installed; the CVE-2026-93748 patch cannot be checked",
    );
  }
  const require = createRequire(import.meta.url);
  return require(join(store, entry, "node_modules/http-cache-semantics"));
}

const CachePolicy = loadCachePolicy();

function policy(
  responseHeaders: HeaderMap,
  options?: {shared?: boolean},
): CachePolicyInstance {
  return new CachePolicy(
    {url: "/document", headers: {host: "example.test"}},
    {headers: responseHeaders},
    options,
  );
}

const maxStaleRequest = {
  url: "/document",
  headers: {host: "example.test", "cache-control": "max-stale=1000"},
};

describe("CVE-2026-93748 — http-cache-semantics stale reuse", () => {
  it("does not serve a shared Set-Cookie response via max-stale", () => {
    const cached = policy({
      "cache-control":
        "max-age=60, stale-if-error=600, stale-while-revalidate=600",
      "set-cookie": "session=other-user",
      age: "120",
    });

    expect(cached.maxAge()).toBe(0);
    expect(cached.timeToLive()).toBe(0);
    expect(cached.useStaleWhileRevalidate()).toBe(false);
    expect(cached.satisfiesWithoutRevalidation(maxStaleRequest)).toBe(false);
    expect(
      cached.revalidatedPolicy(
        {url: "/document", headers: {host: "example.test"}},
        {status: 503, headers: {}},
      ).modified,
    ).toBe(true);
  });

  it("still serves an ordinary expired max-age response via max-stale", () => {
    const cached = policy({"cache-control": "max-age=60", age: "120"});
    expect(cached.satisfiesWithoutRevalidation(maxStaleRequest)).toBe(true);
  });

  it("still serves a fresh response", () => {
    const cached = policy({"cache-control": "max-age=60", age: "1"});
    expect(
      cached.satisfiesWithoutRevalidation({
        url: "/document",
        headers: {host: "example.test"},
      }),
    ).toBe(true);
  });

  it("still allows max-stale when Set-Cookie was explicitly marked public", () => {
    const cached = policy({
      "cache-control": "public, max-age=60",
      "set-cookie": "session=other-user",
      age: "120",
    });
    expect(cached.maxAge()).toBe(60);
    expect(cached.satisfiesWithoutRevalidation(maxStaleRequest)).toBe(true);
  });

  it("still allows max-stale for a private cache", () => {
    const cached = policy(
      {
        "cache-control": "max-age=60",
        "set-cookie": "session=this-user",
        age: "120",
      },
      {shared: false},
    );
    expect(cached.satisfiesWithoutRevalidation(maxStaleRequest)).toBe(true);
  });

  it("does not serve proxy-revalidate, Vary *, or no-cache via max-stale", () => {
    const proxyRevalidate = policy({
      "cache-control": "max-age=60, proxy-revalidate",
      age: "10",
    });
    const varyStar = policy({
      "cache-control": "max-age=60",
      vary: "*",
      age: "1",
    });
    const noCache = policy({
      "cache-control": "max-age=60, no-cache",
      age: "1",
    });

    expect(proxyRevalidate.satisfiesWithoutRevalidation(maxStaleRequest)).toBe(
      false,
    );
    expect(proxyRevalidate.timeToLive()).toBe(0);
    expect(varyStar.satisfiesWithoutRevalidation(maxStaleRequest)).toBe(false);
    expect(noCache.satisfiesWithoutRevalidation(maxStaleRequest)).toBe(false);
  });
});
