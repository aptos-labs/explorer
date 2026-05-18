import {defineHandlerCallback} from "@tanstack/react-router/ssr/server";
import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";
import llmsReference from "../public/llms.txt?raw";
import {handleApiProxy, isProxyRequest} from "./utils/aptosApiProxy";
import {negotiateMarkdownHomepage} from "./utils/markdownHomeNegotiation";

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
    const request = args[0] as Request;
    const url = new URL(request.url);
    if (isProxyRequest(url.pathname)) {
      return handleApiProxy(request);
    }
    return fetch(...args);
  },
};
