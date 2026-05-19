// Vercel project configuration. Sibling to `netlify.toml` — the explorer
// currently deploys to both hosts during the Netlify → Vercel transition.
//
// The production-grade routing (headers, redirects, cache rules, SSR
// rewrite) lives in `scripts/build-vercel-output.mjs`, which emits the
// Build Output API v3 layout under `.vercel/output/`. This file just tells
// Vercel which command produces that output and that no framework preset
// should be applied (TanStack Start is not a Vercel-aware framework).
//
// When updating headers / redirects, keep `netlify.toml` and
// `scripts/build-vercel-output.mjs` in sync. See AGENTS.md →
// "Vercel and Netlify dual deploy" for the contract.
//
// Typed loosely on purpose to avoid pulling `@vercel/config` into the
// dependency tree. Vercel accepts both `vercel.json` and `vercel.ts`; for
// the TS form it imports the exported `config` (default or named) and
// validates server-side.

export const config = {
  framework: null,
  buildCommand: "node scripts/build-vercel-output.mjs",
  installCommand: "pnpm install --frozen-lockfile",
  // Build script writes the Build Output API layout itself; Vercel detects
  // `.vercel/output/` automatically but the explicit setting makes
  // misconfiguration loud rather than silent.
  outputDirectory: ".vercel/output",
} as const;

export default config;
