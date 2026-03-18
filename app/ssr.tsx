import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";
import {defineHandlerCallback} from "@tanstack/react-router/ssr/server";

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

  if (pathname === "/blocks" || pathname.startsWith("/validators/")) {
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

const cacheAwareRenderHandler = defineHandlerCallback((ctx) => {
  ctx.responseHeaders.set("Cache-Control", getSsrCacheControl(ctx.request));
  return defaultRenderHandler(ctx);
});

// Use defaultRenderHandler instead of defaultStreamHandler because:
// - defaultRenderHandler uses renderRouterToString which includes <!DOCTYPE html>
// - defaultStreamHandler uses renderRouterToStream which does NOT include DOCTYPE
// This prevents Quirks Mode issues
export default createStartHandler(cacheAwareRenderHandler);
