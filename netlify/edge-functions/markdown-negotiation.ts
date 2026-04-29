import type {Config, Context} from "@netlify/edge-functions";
import {
  estimateMarkdownTokens,
  htmlToMarkdown,
} from "../../app/utils/htmlToMarkdown.ts";
// Shared with the app (unit-tested in app/utils/acceptMarkdown.test.ts).
// Netlify Edge Functions run under Deno and support TypeScript imports from
// inside the repo, so we re-use the single implementation instead of keeping
// a drift-prone copy here.
import {prefersMarkdown} from "../../app/utils/acceptMarkdown.ts";

/**
 * Markdown negotiation for AI agents.
 *
 * When a client sends `Accept: text/markdown` (or `text/markdown` appears
 * anywhere in the Accept header with non-zero q-value, e.g. Cloudflare's
 * "Markdown for Agents" pattern), we ask the normal SSR/static handler for
 * HTML and convert that HTML response to markdown at the edge.
 *
 * Strategy:
 *  - Requests without a markdown preference fall through unchanged.
 *  - Markdown requests keep the default browser behavior downstream by sending
 *    `Accept: text/html`; this avoids SSR/content-type negotiation surprises.
 *  - Only HTML responses are transformed. Assets, API responses, and direct
 *    text files pass through unchanged.
 *
 * This gives AI agents a markdown representation of the same route browsers
 * see while preserving HTML as the default.
 */
function appendVary(headers: Headers, value: string) {
  const current = headers.get("Vary");
  if (!current) {
    headers.set("Vary", value);
    return;
  }

  const values = current.split(",").map((part) => part.trim().toLowerCase());
  if (!values.includes(value.toLowerCase())) {
    headers.set("Vary", `${current}, ${value}`);
  }
}

function isHtmlResponse(response: Response): boolean {
  return response.headers.get("Content-Type")?.includes("text/html") ?? false;
}

function createHtmlRequest(request: Request): Request {
  const headers = new Headers(request.headers);
  headers.set(
    "Accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  );

  if (request.method === "HEAD") {
    return new Request(request.url, {
      headers,
      method: "GET",
    });
  }

  return new Request(request, {headers});
}

export default async function handler(
  request: Request,
  context: Context,
): Promise<Response | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;

  const accept = request.headers.get("accept");
  if (!prefersMarkdown(accept)) return undefined;

  const response = await context.next(createHtmlRequest(request));
  if (!isHtmlResponse(response)) return response;

  const headers = new Headers(response.headers);

  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set(
    "Link",
    [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/index"; type="application/json"',
      '</.well-known/mcp/server-card.json>; rel="https://modelcontextprotocol.io/rel/server-card"; type="application/json"',
      '</llms-full.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Full)"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"',
    ].join(", "),
  );
  headers.set("X-Markdown-Source", "html-response");
  appendVary(headers, "Accept");
  headers.delete("Content-Encoding");
  headers.delete("Content-Length");

  if (request.method === "HEAD") {
    return new Response(null, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html, request.url);
  headers.set("X-Markdown-Tokens", String(estimateMarkdownTokens(markdown)));

  return new Response(markdown, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export const config: Config = {
  path: "/*",
};
