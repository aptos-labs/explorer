/**
 * Vercel Web Analytics helpers (FEAT-TELEMETRY-002).
 *
 * Explorer URLs embed addresses, hashes, and search text. Before a pageview is
 * sent, rewrite those segments to the matching route templates and drop every
 * query param except `network`.
 */

/** First path segment of entity pages whose second segment is an identifier. */
export const VERCEL_ANALYTICS_ENTITY_PARAMS: Record<string, string> = {
  account: "$address",
  object: "$address",
  txn: "$txnHashOrVersion",
  block: "$height",
  validator: "$address",
  coin: "$struct",
  fungible_asset: "$address",
  token: "$tokenId",
};

const FALLBACK_ORIGIN = "https://explorer.aptoslabs.com";

export function sanitizeVercelAnalyticsPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  const [prefix, _id, ...rest] = segments;
  const param = VERCEL_ANALYTICS_ENTITY_PARAMS[prefix];
  if (param && segments.length >= 2) {
    const tail = rest.length > 0 ? `/${rest.join("/")}` : "";
    return `/${prefix}/${param}${tail}`;
  }

  return `/${segments.join("/")}`;
}

export function redactVercelAnalyticsUrl(urlString: string): string {
  const url = parseAnalyticsUrl(urlString);
  url.pathname = sanitizeVercelAnalyticsPathname(url.pathname);
  const network = url.searchParams.get("network");
  url.search = "";
  url.hash = "";
  if (network) {
    url.searchParams.set("network", network);
  }
  return url.href;
}

export type VercelAnalyticsBeforeSendEvent = {
  type: "pageview" | "event";
  url: string;
};

/**
 * `@vercel/analytics` `beforeSend` hook: redact entity ids and query strings.
 */
export function vercelAnalyticsBeforeSend<
  T extends VercelAnalyticsBeforeSendEvent,
>(event: T): T {
  return {
    ...event,
    url: redactVercelAnalyticsUrl(event.url),
  };
}

function parseAnalyticsUrl(urlString: string): URL {
  try {
    return new URL(urlString);
  } catch {
    return new URL(urlString, FALLBACK_ORIGIN);
  }
}
