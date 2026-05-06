import {prefersMarkdown} from "./acceptMarkdown";

const MARKDOWN_HOME_PATHS = new Set(["/", "/index.html"]);

const MARKDOWN_LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/index"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"; title="MCP Server Card"',
  '</llms-full.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Full)"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(", ");

/**
 * When the homepage is requested with `Accept: text/markdown`, respond with the
 * bundled `llms.txt` body as markdown (used by SSR; previously a Netlify Edge
 * Function). Other paths and Accept values return null so the normal HTML path
 * runs.
 */
export function negotiateMarkdownHomepage(
  request: Request,
  llmsText: string,
): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  if (!prefersMarkdown(request.headers.get("accept"))) return null;

  const url = new URL(request.url);
  if (!MARKDOWN_HOME_PATHS.has(url.pathname)) return null;

  const body = request.method === "HEAD" ? null : llmsText;
  const headers = new Headers();
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  );
  headers.set("Vary", "Accept");
  headers.set("Link", MARKDOWN_LINK_HEADER);
  headers.set("X-Markdown-Source", "/llms.txt");

  return new Response(body, {status: 200, headers});
}
