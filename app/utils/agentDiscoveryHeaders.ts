/**
 * RFC 8288 Link values advertised on HTML SSR responses and markdown
 * negotiation. Kept in sync with the `Link` headers in `vercel.json`
 * (static files still use host header rules; SSR function responses
 * do not always inherit them, so the server entry must set these itself).
 */
export const DISCOVERY_LINK_VALUES = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/index"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"; title="MCP Server Card"',
  '</.well-known/agent-card.json>; rel="describedby"; type="application/json"; title="A2A Agent Card"',
  '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
  '</llms.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Summary)"',
  '</llms-full.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Full)"',
  '</auth.md>; rel="describedby"; type="text/markdown"; title="auth.md"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
] as const;

export const DISCOVERY_LINK_HEADER = DISCOVERY_LINK_VALUES.join(", ");

function varyIncludesAccept(vary: string): boolean {
  return vary.split(",").some((part) => part.trim().toLowerCase() === "accept");
}

/**
 * Ensure an SSR response advertises discovery `Link`s and `Vary: Accept`.
 * `vercel.json` `headers` apply to static assets; SSR function responses
 * may not inherit them, so homepage scans must see these headers on the
 * HTML the function returns.
 */
export function attachAgentDiscoveryHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  let changed = false;

  if (!headers.has("Link")) {
    headers.set("Link", DISCOVERY_LINK_HEADER);
    changed = true;
  }

  const vary = headers.get("Vary");
  if (!vary) {
    headers.set("Vary", "Accept");
    changed = true;
  } else if (!varyIncludesAccept(vary)) {
    headers.set("Vary", `${vary}, Accept`);
    changed = true;
  }

  if (!changed) return response;

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Pathname of `request.url`, including relative URLs some adapters pass.
 */
export function getRequestPathname(request: Request): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    const path = request.url.split("?")[0] ?? "/";
    return path.startsWith("/") ? path : `/${path}`;
  }
}

/**
 * Origin of `request.url`, falling back to the production explorer host.
 */
export function getRequestOrigin(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return "https://explorer.aptoslabs.com";
  }
}
