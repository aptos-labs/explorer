/**
 * Decides whether the explorer should issue CoinGecko requests through the
 * site's `/api/coingecko/*` Netlify Function proxy or hit
 * `api.coingecko.com` directly from the user's browser.
 *
 * Why the toggle: if the proxy ever becomes a worse choice than direct
 * fetches (CoinGecko rate-limits the Netlify egress IP pool, the function
 * is temporarily down, etc.), operators can flip a single flag to fall back
 * to direct CoinGecko without redeploying client code.
 *
 * Resolution order (first match wins):
 *   1. The `use_coingecko_proxy` cookie, if it is exactly `true` or `false`.
 *      Lets ops flip behavior at runtime without a redeploy.
 *   2. The `VITE_USE_COINGECKO_PROXY` build-time env var (`true` / `false`).
 *   3. Production default = `true` (proxy on).
 *      Dev default       = `false` (so `pnpm dev` against a non-Netlify host
 *      still works — there is no function to call locally without
 *      `netlify dev`).
 */

import Cookies from "js-cookie";

const PROXY_PATH_PREFIX = "/api/coingecko";
const DIRECT_BASE = "https://api.coingecko.com/api/v3";
const FLAG_COOKIE = "use_coingecko_proxy";
const FLAG_ENV = "VITE_USE_COINGECKO_PROXY";

/**
 * Map a CoinGecko upstream sub-path to either the proxy or direct URL,
 * preserving query string.
 *
 * @param subPath one of the supported proxy endpoints, e.g. `"price"` or `"markets"`.
 * @param directPath the matching CoinGecko REST sub-path, e.g. `"/simple/price"`.
 * @param query the query string (with or without leading `?`).
 */
export function resolveCoingeckoUrl(
  subPath: "price" | "markets",
  directPath: `/${string}`,
  query: string,
): string {
  const qs = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  if (shouldUseCoingeckoProxy()) {
    return `${PROXY_PATH_PREFIX}/${subPath}${qs}`;
  }
  return `${DIRECT_BASE}${directPath}${qs}`;
}

/**
 * Whether the explorer should use the Netlify Function proxy for CoinGecko.
 * Safe to call on the server (SSR) — falls back to the production default.
 *
 * Not a React hook despite returning a boolean; named without `use` to
 * avoid tripping the rules-of-hooks lint rule when called from
 * non-component code paths (loaders, plain async functions like
 * `getPrice`).
 *
 * @internal Exported for unit tests.
 */
export function shouldUseCoingeckoProxy(): boolean {
  const cookieValue = readCookieFlag();
  if (cookieValue !== null) return cookieValue;

  const envValue = readEnvFlag();
  if (envValue !== null) return envValue;

  return isProductionBuild();
}

function readCookieFlag(): boolean | null {
  if (typeof document === "undefined") return null;
  const raw = Cookies.get(FLAG_COOKIE);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

function readEnvFlag(): boolean | null {
  try {
    // import.meta.env may not be available in all contexts.
    const env = (import.meta as ImportMeta).env as
      | Record<string, string | undefined>
      | undefined;
    const value = env?.[FLAG_ENV];
    if (value === "true") return true;
    if (value === "false") return false;
  } catch {
    // Best-effort.
  }
  return null;
}

function isProductionBuild(): boolean {
  try {
    const env = (import.meta as ImportMeta).env as
      | Record<string, string | boolean | undefined>
      | undefined;
    if (env?.PROD === true || env?.PROD === "true") return true;
    if (env?.MODE === "production") return true;
  } catch {
    // Fall through.
  }
  // Conservative default for non-Vite contexts (tests, SSR fallback).
  return false;
}
