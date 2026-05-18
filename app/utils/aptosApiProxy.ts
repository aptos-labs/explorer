/**
 * Server-side Aptos API proxy.
 *
 * Forwards browser requests from `/api/aptos/{network}/…` to the real Aptos
 * API endpoint, injecting the server-only `APTOS_<NETWORK>_API_KEY` as an
 * `Authorization` header.  This keeps the API key out of the client JS bundle.
 *
 * When a user configures their own key via Settings, the client bypasses the
 * proxy and calls the Aptos API directly with their key.
 */

import {
  getServerApiKey,
  isValidNetworkName,
  type NetworkName,
  networks,
} from "../lib/constants";

const PROXY_PREFIX = "/api/aptos/";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export function isProxyRequest(pathname: string): boolean {
  return pathname.startsWith(PROXY_PREFIX);
}

/**
 * Return the proxy base URL (relative, same-origin) for a given network.
 * The Aptos SDK will append REST paths or call the indexer endpoint directly.
 */
export function getProxyFullnodeUrl(networkName: NetworkName): string {
  return `${PROXY_PREFIX}${networkName}/v1`;
}

export function getProxyIndexerUrl(networkName: NetworkName): string {
  return `${PROXY_PREFIX}${networkName}/v1/graphql`;
}

function stripBaseUrl(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/v1\/?$/, "");
  } catch {
    return url.replace(/\/v1\/?$/, "");
  }
}

function getTargetBaseUrl(networkName: NetworkName): string | undefined {
  const fullnodeUrl = networks[networkName];
  if (!fullnodeUrl) return undefined;
  return stripBaseUrl(fullnodeUrl);
}

export async function handleApiProxy(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathAfterPrefix = url.pathname.slice(PROXY_PREFIX.length);

  // Parse: {network}/v1/{rest}  or  {network}/v1/graphql
  const slashIdx = pathAfterPrefix.indexOf("/");
  const networkName =
    slashIdx === -1 ? pathAfterPrefix : pathAfterPrefix.slice(0, slashIdx);
  const restPath = slashIdx === -1 ? "" : pathAfterPrefix.slice(slashIdx);

  if (!isValidNetworkName(networkName)) {
    return new Response(JSON.stringify({error: "Invalid network"}), {
      status: 400,
      headers: {"Content-Type": "application/json"},
    });
  }

  const targetBase = getTargetBaseUrl(networkName);
  if (!targetBase) {
    return new Response(JSON.stringify({error: "Network not configured"}), {
      status: 400,
      headers: {"Content-Type": "application/json"},
    });
  }

  const targetUrl = `${targetBase}${restPath}${url.search}`;

  const apiKey = getServerApiKey(networkName);

  const proxyHeaders = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== "host") {
      proxyHeaders.set(key, value);
    }
  }
  if (apiKey) {
    proxyHeaders.set("Authorization", `Bearer ${apiKey}`);
  }

  try {
    const upstream = await globalThis.fetch(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      // @ts-expect-error -- Node 18+ supports duplex on Request with body
      duplex: request.body ? "half" : undefined,
    });

    const responseHeaders = new Headers();
    for (const [key, value] of upstream.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }
    responseHeaders.set("X-Proxied-By", "aptos-explorer");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return new Response(JSON.stringify({error: "Upstream request failed"}), {
      status: 502,
      headers: {"Content-Type": "application/json"},
    });
  }
}
