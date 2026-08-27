/**
 * Read a process env var at **runtime**.
 *
 * Vite/Rolldown's client transform replaces the identifier `process.env` with
 * a build-time object (often `{}` for names outside `envPrefix`). That turns
 * `process.env.APTOS_MAINNET_API_KEY` and even `process.env[dynamicName]` into
 * a lookup on `{}`, so SSR never sees Vercel runtime secrets.
 *
 * Indexing `process["env"]` is not that identifier, so Node SSR keeps a live
 * `process.env`. Do not change this to `process.env.FOO` without a client-bundle
 * check that the lookup is still dynamic.
 */
export function readProcessEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const env = process["env"];
  if (!env) return undefined;
  const value = env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
