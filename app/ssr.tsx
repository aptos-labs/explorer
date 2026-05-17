import {defineHandlerCallback} from "@tanstack/react-router/ssr/server";
import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";
import llmsReference from "../public/llms.txt?raw";
import {negotiateMarkdownHomepage} from "./utils/markdownHomeNegotiation";

/**
 * Edge `Cache-Control` per route, biased toward longer `s-maxage` on
 * effectively-immutable routes (single transaction / block / coin / FA /
 * token / object detail). Dynamic data on those pages — balances, recent
 * activity, supply — still re-fetches client-side after hydration; the
 * cached HTML only covers the first paint, so an old `s-maxage` here is
 * not visible to the user.
 *
 * `max-age=0` keeps browser caches honest. `s-maxage` only applies to the
 * shared (CDN) cache, and `stale-while-revalidate` lets Netlify serve a
 * slightly-stale page while it asynchronously revalidates the origin.
 */
function getSsrCacheControl(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return "no-store";
  }

  const url = new URL(request.url);
  const network = url.searchParams.get("network");
  if (network === "local") {
    return "no-store";
  }

  const {pathname} = url;

  // Always-changing list pages. Short s-maxage so the user sees recent
  // activity; SWR keeps the CDN warm.
  if (
    pathname === "/" ||
    pathname === "/transactions" ||
    pathname === "/analytics"
  ) {
    return "public, max-age=0, s-maxage=15, stale-while-revalidate=60";
  }

  // Recent blocks + validator list. Medium s-maxage because client-side
  // refresh still picks up new blocks within seconds.
  if (
    pathname === "/blocks" ||
    pathname === "/validators" ||
    pathname === "/validators-enhanced" ||
    pathname.startsWith("/validators/")
  ) {
    return "public, max-age=0, s-maxage=60, stale-while-revalidate=300";
  }

  // Immutable detail pages: a confirmed transaction or block never changes.
  // 24h s-maxage + 30d SWR. Effectively serve from edge forever for the
  // common case of someone re-sharing a transaction link.
  if (pathname.startsWith("/txn/") || pathname.startsWith("/block/")) {
    return "public, max-age=0, s-maxage=86400, stale-while-revalidate=2592000";
  }

  // Coin / FA / token / module / object detail pages: the underlying entity
  // (metadata, decimals, symbol, total supply) effectively never changes for
  // confirmed assets, and the volatile bits (recent activity, holder lists)
  // are loaded client-side and bypass this cache. Bump s-maxage to 1 h with a
  // 24 h SWR so the CDN absorbs the long tail of repeat views.
  if (
    pathname.startsWith("/coin/") ||
    pathname.startsWith("/fungible_asset/") ||
    pathname.startsWith("/token/") ||
    pathname.startsWith("/object/")
  ) {
    return "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
  }

  // Per-validator detail. Voting power / commission can change over an
  // epoch, so keep the cache shorter than coin/FA detail.
  if (pathname.startsWith("/validator/")) {
    return "public, max-age=0, s-maxage=300, stale-while-revalidate=1800";
  }

  // Account / module pages: the address layout is stable but balances and
  // resources change. 30 s with 2 min SWR balances freshness against load.
  if (pathname.startsWith("/account/")) {
    return "public, max-age=0, s-maxage=30, stale-while-revalidate=120";
  }

  return "public, max-age=0, s-maxage=30, stale-while-revalidate=120";
}

const cacheAwareRenderHandler = defineHandlerCallback(async (ctx) => {
  const markdown = negotiateMarkdownHomepage(ctx.request, llmsReference);
  if (markdown) return markdown;

  ctx.responseHeaders.set("Cache-Control", getSsrCacheControl(ctx.request));
  return defaultRenderHandler(ctx);
});

// Use defaultRenderHandler instead of defaultStreamHandler because:
// - defaultRenderHandler uses renderRouterToString which includes <!DOCTYPE html>
// - defaultStreamHandler uses renderRouterToStream which does NOT include DOCTYPE
// This prevents Quirks Mode issues
const fetch = createStartHandler(cacheAwareRenderHandler);

// `@netlify/vite-plugin` (used via `@netlify/vite-plugin-tanstack-start`) writes
// a Netlify Function wrapper that does `serverEntrypoint.fetch` on this
// module's default export — see the framework's own `default-entry/server.js`
// which wraps the handler in `{ fetch }` for the same reason. Exporting the
// raw handler here causes the deployed lambda to throw
// `TypeError: y.handler is not a function` at runtime because
// `serverEntrypoint.fetch` resolves to `undefined`.
export default {
  async fetch(...args: Parameters<typeof fetch>) {
    return fetch(...args);
  },
};
