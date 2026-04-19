import type {Config, Context} from "@netlify/edge-functions";
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
 * "Markdown for Agents" pattern), we return a pre-rendered markdown view of
 * the page instead of the HTML SPA shell.
 *
 * Strategy:
 *  - `/` (and a small set of top-level landing paths) → serve the short LLM
 *    reference (`/llms.txt`) with `Content-Type: text/markdown`.
 *  - Fall through to the default HTML handler for all other paths and for
 *    requests without a markdown preference in Accept.
 *
 * This gives AI agents a stable, concise markdown summary of the Explorer
 * without shipping a full HTML→markdown converter at the edge. The full LLM
 * reference stays available at `/llms-full.txt`.
 */

const MARKDOWN_ROUTES: ReadonlySet<string> = new Set(["/", "/index.html"]);

export default async function handler(
  request: Request,
  context: Context,
): Promise<Response | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;

  const accept = request.headers.get("accept");
  if (!prefersMarkdown(accept)) return undefined;

  const url = new URL(request.url);
  if (!MARKDOWN_ROUTES.has(url.pathname)) {
    // For non-landing paths we still let the HTML handler respond. Agents that
    // want full markdown reference should fetch /llms-full.txt directly.
    return undefined;
  }

  const llmsUrl = new URL("/llms.txt", url.origin);
  const upstream = await context.fetch(llmsUrl.toString(), {
    headers: {Accept: "text/plain"},
  });

  if (!upstream.ok) {
    // Fall through to the default HTML renderer rather than returning 500.
    return undefined;
  }

  const body = request.method === "HEAD" ? null : await upstream.text();
  const headers = new Headers();
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  );
  headers.set("Vary", "Accept");
  headers.set(
    "Link",
    [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/index"; type="application/json"',
      '</llms-full.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Full)"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"',
    ].join(", "),
  );
  headers.set("X-Markdown-Source", "/llms.txt");

  return new Response(body, {status: 200, headers});
}

export const config: Config = {
  path: ["/", "/index.html"],
};
