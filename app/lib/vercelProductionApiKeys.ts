/**
 * Vercel production client bundles inline `VITE_APTOS_*_API_KEY` at **build**
 * time. Runtime-only project env vars never reach the browser, so every
 * client request falls into Geomi's anonymous IP bucket and 429s look like
 * "the key is rate limited" when no key was sent at all.
 *
 * Preview deploys (`VERCEL_ENV=preview`) intentionally omit keys.
 */

export const VERCEL_PRODUCTION_CLIENT_API_KEY_VARS = [
  "VITE_APTOS_MAINNET_API_KEY",
  "VITE_APTOS_TESTNET_API_KEY",
  "VITE_APTOS_DEVNET_API_KEY",
] as const;

export function missingVercelProductionClientApiKeys(
  env: Record<string, string | undefined> = process.env,
): string[] {
  if (env.VERCEL_ENV !== "production") return [];
  return VERCEL_PRODUCTION_CLIENT_API_KEY_VARS.filter(
    (name) => !env[name]?.trim(),
  );
}

export function assertVercelProductionClientApiKeys(
  env: Record<string, string | undefined> = process.env,
): void {
  const missing = missingVercelProductionClientApiKeys(env);
  if (missing.length === 0) return;
  throw new Error(
    `[aptos-explorer] Refusing to build a Vercel production client bundle without ${missing.join(", ")}. ` +
      `Those variables are inlined at build time; marking them runtime-only in Vercel will not attach a key in the browser. ` +
      `Without them, Geomi 429s are the anonymous IP bucket ("Per anonymous IP rate limit exceeded"), not a named key's quota. ` +
      `Use a Geomi **client** key whose allowed origin includes https://explorer.aptoslabs.com, and enable the vars for Production **Build**.`,
  );
}
