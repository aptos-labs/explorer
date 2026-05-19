#!/usr/bin/env node
// Build the Vercel Build Output API v3 layout (`.vercel/output/`) from the
// Vite SSR build. Sibling to `@netlify/vite-plugin-tanstack-start`, which
// writes `.netlify/v1/functions/server.mjs` for Netlify. Both targets share
// one `pnpm build` — this script just rewrites the artifacts into the shape
// Vercel expects.
//
// IMPORTANT: when editing headers / redirects / cache rules here, also keep
// `netlify.toml` in sync. The two configs are the source of truth for their
// respective hosts; AGENTS.md ("Vercel and Netlify dual deploy") has the rule.

import {spawnSync} from "node:child_process";
import {cpSync, existsSync, mkdirSync, rmSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distClient = path.join(repoRoot, "dist", "client");
const distServer = path.join(repoRoot, "dist", "server");
const outRoot = path.join(repoRoot, ".vercel", "output");
const outStatic = path.join(outRoot, "static");
const outFn = path.join(outRoot, "functions", "index.func");

// Vercel injects VERCEL_ENV = "production" | "preview" | "development".
// We surface it to the client bundle as VITE_VERCEL_CONTEXT so client code
// can suppress API keys on preview deploys (URLs the keys aren't scoped to),
// mirroring the existing VITE_NETLIFY_CONTEXT behavior.
const vercelEnv = process.env.VERCEL_ENV;
if (vercelEnv === "production" || vercelEnv === "preview") {
  process.env.VITE_VERCEL_CONTEXT = vercelEnv;
}

// Run the shared vite build via `pnpm run build` so the `prebuild` hook
// (`pnpm routes:generate`) still fires.
const build = spawnSync("pnpm", ["run", "build"], {
  stdio: "inherit",
  env: process.env,
  cwd: repoRoot,
});
if (build.status !== 0) process.exit(build.status ?? 1);

if (!existsSync(distClient)) {
  console.error(`[build-vercel-output] missing ${distClient}`);
  process.exit(1);
}
if (!existsSync(path.join(distServer, "ssr.js"))) {
  console.error(
    `[build-vercel-output] missing ${path.join(distServer, "ssr.js")}`,
  );
  process.exit(1);
}

rmSync(outRoot, {recursive: true, force: true});
mkdirSync(outStatic, {recursive: true});
mkdirSync(outFn, {recursive: true});

cpSync(distClient, outStatic, {recursive: true});
cpSync(distServer, outFn, {recursive: true});

writeFileSync(
  path.join(outFn, "index.mjs"),
  `import ssr from "./ssr.js";\nexport default ssr.fetch;\n`,
);

writeFileSync(
  path.join(outFn, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs24.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
      // Fluid Compute bills Active CPU time, not wall-clock — a 300s ceiling
      // is essentially free for an SSR handler that's mostly awaiting Aptos
      // upstream I/O. Matches Vercel's current platform default.
      maxDuration: 300,
    },
    null,
    2,
  ),
);

// Security headers applied to every response.
const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "geolocation=(), microphone=(), camera=(), usb=(), payment=()",
  "X-XSS-Protection": "1; mode=block",
};

// Agent / LLM discovery Link header. Kept identical to netlify.toml.
const LINK_HEADER =
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", ' +
  '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/index"; type="application/json", ' +
  '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"; title="MCP Server Card", ' +
  '</llms.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Summary)", ' +
  '</llms-full.txt>; rel="alternate"; type="text/plain"; title="LLM Documentation (Full)", ' +
  '</sitemap.xml>; rel="sitemap"; type="application/xml"';

// Legacy subdomain redirects. Mirror of the host-based redirects in
// netlify.toml; `$1` is the captured path segment, query strings on the
// origin URL are not preserved (Netlify behavior is the same — `:splat`
// rewrites the query string).
const LEGACY_HOST_REDIRECTS = [
  ["explorer.devnet.aptos.dev", "devnet"],
  ["devnet.aptos.dev", "devnet"],
  ["explorer.testnet.aptos.dev", "testnet"],
  ["testnet.aptos.dev", "testnet"],
  ["explorer.mainnet.aptos.dev", "mainnet"],
  ["mainnet.aptos.dev", "mainnet"],
  ["explorer.aptos.dev", "mainnet"],
].map(([host, network]) => ({
  src: "/(.*)",
  has: [{type: "host", value: host}],
  status: 301,
  headers: {
    Location: `https://explorer.aptoslabs.com/$1?network=${network}`,
  },
}));

const config = {
  version: 3,
  routes: [
    ...LEGACY_HOST_REDIRECTS,

    // Security + Link headers on every response.
    {
      src: "/(.*)",
      headers: {...SECURITY_HEADERS, Link: LINK_HEADER},
      continue: true,
    },

    // Homepage advertises content negotiation.
    {
      src: "^/$",
      headers: {Vary: "Accept"},
      continue: true,
    },

    // Long-lived hashed assets.
    {
      src: "/assets/(.*)",
      headers: {"Cache-Control": "public, max-age=31536000, immutable"},
      continue: true,
    },
    {
      src: "/(.+)\\.svg",
      headers: {"Cache-Control": "public, max-age=86400"},
      continue: true,
    },
    {
      src: "/(.+)\\.png",
      headers: {"Cache-Control": "public, max-age=86400"},
      continue: true,
    },
    {
      src: "/(.+)\\.ico",
      headers: {"Cache-Control": "public, max-age=86400"},
      continue: true,
    },

    // PWA service worker must not be cached.
    {
      src: "/sw\\.js",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Service-Worker-Allowed": "/",
      },
      continue: true,
    },
    {
      src: "/workbox-(.*)\\.js",
      headers: {"Cache-Control": "public, max-age=31536000, immutable"},
      continue: true,
    },

    // PWA manifests.
    {
      src: "/manifest\\.webmanifest",
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": "application/manifest+json",
      },
      continue: true,
    },
    {
      src: "/manifest\\.json",
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": "application/manifest+json",
      },
      continue: true,
    },

    // LLM discovery files.
    {
      src: "/llms\\.txt",
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noarchive",
      },
      continue: true,
    },
    {
      src: "/llms-full\\.txt",
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noarchive",
      },
      continue: true,
    },

    // Sitemap / robots.
    {
      src: "/sitemap\\.xml",
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/xml; charset=utf-8",
      },
      continue: true,
    },
    {
      src: "/robots\\.txt",
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": "text/plain; charset=utf-8",
      },
      continue: true,
    },

    // Well-known agent discovery surfaces (CORS open).
    {
      src: "/\\.well-known/api-catalog",
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/linkset+json",
        "Access-Control-Allow-Origin": "*",
      },
      continue: true,
    },
    {
      src: "/\\.well-known/agent-skills/index\\.json",
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      continue: true,
    },
    {
      src: "/\\.well-known/mcp/server-card\\.json",
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      continue: true,
    },

    // Serve static files first, then fall through to SSR.
    {handle: "filesystem"},
    {src: "/(.*)", dest: "/index"},
  ],
};

writeFileSync(
  path.join(outRoot, "config.json"),
  JSON.stringify(config, null, 2),
);

console.log(`[build-vercel-output] wrote ${outRoot}`);
