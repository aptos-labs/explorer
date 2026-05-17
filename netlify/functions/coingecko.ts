/**
 * CoinGecko-proxy Netlify Function.
 *
 * Why this exists:
 *   - The explorer makes CoinGecko requests from the browser for APT price
 *     (`useGetPrice`) and the full coin market data table (`useGetCoinMarketData`).
 *   - CoinGecko's free tier is 10–50 requests/minute *per IP*. When many users
 *     load the explorer simultaneously, individual users can be silently
 *     throttled or returned 429s — see `app/api/hooks/useGetCoinMarketData.ts`
 *     for the existing client-side rate-limit handling.
 *   - Proxying through this function means *one* server-side request per
 *     (endpoint, query) per cache window, which Netlify's CDN then serves
 *     to every concurrent user for free via `Cache-Control: s-maxage`.
 *
 * Routes (configured in `netlify.toml`):
 *   - `GET /api/coingecko/price?ids=aptos&vs_currencies=usd`
 *       → proxies `https://api.coingecko.com/api/v3/simple/price`
 *   - `GET /api/coingecko/markets?ids=aptos,bitcoin&vs_currency=usd&...`
 *       → proxies `https://api.coingecko.com/api/v3/coins/markets`
 *
 * Cache headers:
 *   - Browser: `max-age=0` (always revalidate)
 *   - CDN: `s-maxage=600, stale-while-revalidate=3600` (one upstream request
 *     per 10 minutes per cache key, with up to one hour of stale-while-revalidate)
 *
 * Toggling off:
 *   If CoinGecko ever rate-limits the Netlify egress IP pool (rare but possible),
 *   set the client-side `VITE_USE_COINGECKO_PROXY=false` env var (or set the
 *   `use_coingecko_proxy=false` cookie at runtime) to send users back to
 *   direct CoinGecko fetches. See `app/api/hooks/coingeckoProxy.ts`.
 */

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CACHE_CONTROL =
  "public, max-age=0, s-maxage=600, stale-while-revalidate=3600";

const ALLOWED_PATHS = new Set([
  "price", // → /simple/price
  "markets", // → /coins/markets
]);

function pathToUpstream(path: string): string | null {
  switch (path) {
    case "price":
      return `${COINGECKO_BASE}/simple/price`;
    case "markets":
      return `${COINGECKO_BASE}/coins/markets`;
    default:
      return null;
  }
}

function jsonResponse(
  status: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return jsonResponse(405, {error: "Method not allowed"});
  }

  const url = new URL(req.url);
  // The redirect strips the leading `/api/coingecko/` so we end up with
  // pathname `/.netlify/functions/coingecko/<endpoint>`. Take the last
  // non-empty segment.
  const segments = url.pathname.split("/").filter(Boolean);
  const endpoint = segments[segments.length - 1] ?? "";

  if (!ALLOWED_PATHS.has(endpoint)) {
    return jsonResponse(404, {error: "Unsupported CoinGecko endpoint"});
  }

  const upstreamBase = pathToUpstream(endpoint);
  if (!upstreamBase) {
    return jsonResponse(404, {error: "Unsupported CoinGecko endpoint"});
  }

  const upstreamUrl = `${upstreamBase}${url.search}`;
  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // Forward CoinGecko's body verbatim. We only override caching headers
    // so the CDN can amortize the request across users.
    const body = await upstream.text();
    const headers: Record<string, string> = {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
      // Cache the response on the edge even when CoinGecko returns a 429
      // (briefly) — agents that get a 429 would otherwise hammer the
      // function. A short cache softens the failure.
      "Cache-Control":
        upstream.ok || upstream.status === 304
          ? CACHE_CONTROL
          : "public, max-age=0, s-maxage=30",
      // Make the response usable from the browser without CORS gymnastics.
      "Access-Control-Allow-Origin": "*",
      // If CoinGecko hinted a retry window, forward it.
    };
    const retryAfter = upstream.headers.get("retry-after");
    if (retryAfter) headers["Retry-After"] = retryAfter;

    return new Response(body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    return jsonResponse(
      502,
      {
        error: "CoinGecko proxy failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {"Cache-Control": "no-store"},
    );
  }
};

export const config = {
  // Path-aware: matches `/api/coingecko/<endpoint>` thanks to the redirect
  // in `netlify.toml`. We also list the same paths here so that, when the
  // function is referenced by name (e.g. `/.netlify/functions/coingecko`),
  // Netlify still routes path segments to it.
  path: "/.netlify/functions/coingecko/*",
};
