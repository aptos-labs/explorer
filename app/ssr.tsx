import {defineHandlerCallback} from "@tanstack/react-router/ssr/server";
import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";
import llmsReference from "../public/llms.txt?raw";
import {attachAgentDiscoveryHeaders} from "./utils/agentDiscoveryHeaders";
import {negotiateMarkdownRequest} from "./utils/markdownHomeNegotiation";

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
  if (
    pathname === "/" ||
    pathname === "/transactions" ||
    pathname === "/analytics"
  ) {
    return "public, max-age=0, s-maxage=15, stale-while-revalidate=60";
  }

  if (
    pathname === "/blocks" ||
    pathname === "/validators" ||
    pathname === "/validators-enhanced" ||
    pathname.startsWith("/validators/")
  ) {
    return "public, max-age=0, s-maxage=60, stale-while-revalidate=300";
  }

  if (pathname.startsWith("/txn/") || pathname.startsWith("/block/")) {
    return "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
  }

  if (
    pathname.startsWith("/account/") ||
    pathname.startsWith("/object/") ||
    pathname.startsWith("/coin/") ||
    pathname.startsWith("/fungible_asset/") ||
    pathname.startsWith("/token/") ||
    pathname.startsWith("/validator/")
  ) {
    return "public, max-age=0, s-maxage=30, stale-while-revalidate=120";
  }

  return "public, max-age=0, s-maxage=30, stale-while-revalidate=120";
}

const cacheAwareRenderHandler = defineHandlerCallback(async (ctx) => {
  ctx.responseHeaders.set("Cache-Control", getSsrCacheControl(ctx.request));
  return defaultRenderHandler(ctx);
});

// Use defaultRenderHandler instead of defaultStreamHandler because:
// - defaultRenderHandler uses renderRouterToString which includes <!DOCTYPE html>
// - defaultStreamHandler uses renderRouterToStream which does NOT include DOCTYPE
// This prevents Quirks Mode issues
const startFetch = createStartHandler(cacheAwareRenderHandler);

/**
 * Wrap TanStack Start so agent clients are not rejected before our handlers
 * run. createStartHandler only allows Accept text/html or a wildcard
 * Accept and otherwise returns HTTP 500 JSON ("Only HTML requests are
 * supported here").
 * Markdown negotiation therefore has to happen on this outer fetch, not
 * inside the render callback. Discovery Link / Vary: Accept are attached
 * here as well because host-level header rules (Vercel `headers` in
 * `vercel.json`, formerly Netlify `[[headers]]`) apply to static assets,
 * not always to SSR function responses.
 */
// Nitro / Vercel invoke this module as a Fetch API handler
// (`serverEntrypoint.fetch`). The framework's own `default-entry/server.js`
// wraps the handler in `{ fetch }` for the same reason. Exporting the
// raw handler here would make `.fetch` resolve to `undefined`.
export default {
  async fetch(...args: Parameters<typeof startFetch>) {
    const request = args[0];
    const markdown = negotiateMarkdownRequest(request, llmsReference);
    if (markdown) return markdown;

    const response = await startFetch(...args);
    return attachAgentDiscoveryHeaders(response);
  },
};
