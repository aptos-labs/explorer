import {prefersMarkdown} from "./acceptMarkdown";
import {
  DISCOVERY_LINK_HEADER,
  getRequestOrigin,
  getRequestPathname,
} from "./agentDiscoveryHeaders";

const MARKDOWN_HOME_PATHS = new Set(["/", "/index.html"]);

/**
 * Paths that are already a specific representation (static assets, well-known
 * JSON, robots, etc.). Leave those to Netlify static serving rather than
 * synthesizing markdown.
 */
function shouldNegotiateMarkdown(pathname: string): boolean {
  if (pathname.startsWith("/assets/")) return false;
  if (pathname.startsWith("/.well-known/")) return false;
  if (pathname.startsWith("/_vercel/")) return false;
  if (pathname === "/sw.js") return false;
  if (/\.[a-z0-9]+$/i.test(pathname) && pathname !== "/index.html") {
    return false;
  }
  return true;
}

function estimateMarkdownTokens(text: string): string {
  return String(Math.max(1, Math.ceil(text.length / 4)));
}

function describeExplorerPath(pathname: string): string {
  if (pathname.startsWith("/txn/")) {
    return "Transaction detail. Identifier is a version number or 0x-prefixed hash; tabs include `overview`, `events`, `payload`, `changes`, `balanceChange`, and `trace`.";
  }
  if (pathname.startsWith("/account/")) {
    return "Account page. Identifier is a 0x address or ANS `.apt` name; tabs include `transactions`, `coins`, `tokens`, `resources`, `modules`, `multisig`, and `info`.";
  }
  if (pathname.startsWith("/object/")) {
    return "Move object page. Identifier is the object address; tabs mirror account tabs (`info`, `transactions`, `coins`, `tokens`, `resources`, `modules`).";
  }
  if (pathname.startsWith("/block/")) {
    return "Block detail. Identifier is the block height; tabs include `overview` and `transactions`.";
  }
  if (pathname.startsWith("/validator/")) {
    return "Individual validator page. Identifier is the validator operator or pool address.";
  }
  if (pathname.startsWith("/validators")) {
    return "Validator list. Tabs: `/validators/all`, `/validators/delegation`, `/validators/enhanced_delegation`.";
  }
  if (pathname.startsWith("/coin/")) {
    return "Coin detail. Identifier is a fully-qualified Move type (`0x1::aptos_coin::AptosCoin`); tabs include `info`, `transactions`, and `holders`.";
  }
  if (pathname.startsWith("/fungible_asset/")) {
    return "Fungible asset detail. Identifier is the metadata object address; tabs include `info`, `transactions`, and `holders`.";
  }
  if (pathname.startsWith("/token/")) {
    return "NFT / digital-asset token detail. Tabs include `overview` and `activities`.";
  }
  if (pathname.startsWith("/releases")) {
    return "Releases hub. Tabs: `/releases/networks`, `/releases/aips`, `/releases/sdks`.";
  }
  if (pathname === "/transactions") {
    return "Recent transactions list. Filter with `?type=user&fn_addr=&fn_module=&fn_name=`.";
  }
  if (pathname === "/blocks") return "Recent blocks list.";
  if (pathname === "/coins") return "Coins list.";
  if (pathname === "/analytics") return "Network analytics (mainnet charts).";
  if (pathname === "/settings") {
    return "Explorer settings, including optional per-network API key overrides and decompiler opt-in.";
  }
  if (pathname === "/run-script") {
    return "Advanced tool to simulate and submit a raw Move script transaction from a connected wallet. Not available to unattended agents.";
  }
  if (pathname === "/verification") return "Verification / provenance page.";
  return "Aptos Explorer page. See `/llms.txt` for URL templates.";
}

function markdownForPath(pathname: string, origin: string): string {
  const canonical = `${origin}${pathname === "/" ? "/" : pathname}`;
  return `# Aptos Explorer — ${pathname}

${describeExplorerPath(pathname)}

- Canonical HTML: ${canonical}
- Homepage markdown: ${origin}/ (send \`Accept: text/markdown\`)
- Short LLM reference: ${origin}/llms.txt
- Full LLM reference: ${origin}/llms-full.txt
- Search unknown identifiers: ${origin}/?search={query}
- Agent skills: ${origin}/.well-known/agent-skills/index.json
- MCP server card: ${origin}/.well-known/mcp/server-card.json
- A2A agent card: ${origin}/.well-known/agent-card.json
- Auth: ${origin}/auth.md (public site; no agent registration)
`;
}

function markdownHeaders(body: string, source: string): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set(
    "Cache-Control",
    "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  );
  headers.set("Vary", "Accept");
  headers.set("Link", DISCOVERY_LINK_HEADER);
  headers.set("X-Markdown-Source", source);
  headers.set("X-Markdown-Tokens", estimateMarkdownTokens(body));
  return headers;
}

/**
 * When a client prefers Accept: text/markdown, respond with markdown
 * instead of running TanStack Start HTML SSR.
 *
 * Must run before createStartHandler: Start only accepts text/html or
 * a wildcard Accept and otherwise returns HTTP 500 JSON ("Only HTML
 * requests are supported here"), which is what production agent scanners hit.
 *
 * Homepage (/ and /index.html) serves bundled llms.txt. Other HTML
 * routes get a short path-specific stub that points at the LLM docs so
 * markdown Accept never 500s.
 */
export function negotiateMarkdownRequest(
  request: Request,
  llmsText: string,
): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  if (!prefersMarkdown(request.headers.get("accept"))) return null;

  const pathname = getRequestPathname(request);
  if (!shouldNegotiateMarkdown(pathname)) return null;

  const isHome = MARKDOWN_HOME_PATHS.has(pathname);
  const body = isHome
    ? llmsText
    : markdownForPath(pathname, getRequestOrigin(request));
  const source = isHome ? "/llms.txt" : pathname;
  const headers = markdownHeaders(body, source);
  const responseBody = request.method === "HEAD" ? null : body;
  return new Response(responseBody, {status: 200, headers});
}

/** @deprecated Use {@link negotiateMarkdownRequest} */
export const negotiateMarkdownHomepage = negotiateMarkdownRequest;
