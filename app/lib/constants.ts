/**
 * Network Configuration
 */
export const devnetUrl =
  import.meta.env.APTOS_DEVNET_URL ||
  "https://api.devnet.staging.aptoslabs.com/v1";

export const networks: Record<string, string> = {
  mainnet: "https://api.mainnet.aptoslabs.com/v1",
  testnet: "https://api.testnet.staging.aptoslabs.com/v1",
  devnet: devnetUrl,
  decibel: "https://api.netna.aptoslabs.com/v1",
  shelbynet: "https://api.shelbynet.staging.shelby.xyz/v1",
  local: "http://127.0.0.1:8080/v1",
};

export const hiddenNetworks: readonly NetworkName[] = [
  "decibel",
  "shelbynet",
] as const;

export type NetworkName = keyof typeof networks;

type ApiKeys = {
  [key in NetworkName]: string | undefined;
};

/**
 * Client API keys (VITE_ prefixed) - exposed in the browser bundle.
 * Use these for client-side API calls only.
 * Set via: VITE_APTOS_<NETWORK>_API_KEY
 *
 * No hardcoded fallback: deployments **must** set the env var (or a per-user
 * Settings override) for the network to be rate-limited under a dedicated
 * client ID. When unset, `getApiKey` emits a one-time `console.error` so
 * the misconfiguration is loud instead of silent (see
 * `warnIfClientMissingApiKey` below).
 *
 * Do NOT rename or remove these env vars — see the
 * "Never rename or remove an environment variable" section in AGENTS.md.
 */
// `|| undefined` normalizes empty-string env vars to `undefined` so the
// missing-key warning path triggers consistently. CI workflows that map
// `VITE_APTOS_<NETWORK>_API_KEY: ${{ secrets.APTOS_<NETWORK>_API_KEY }}`
// resolve to an empty string when the secret is not set (e.g. on PRs from
// forks that can't read repo secrets), and an empty Authorization header
// would otherwise be sent to the API gateway.
const clientApiKeys: ApiKeys = {
  mainnet: import.meta.env.VITE_APTOS_MAINNET_API_KEY || undefined,
  testnet: import.meta.env.VITE_APTOS_TESTNET_API_KEY || undefined,
  devnet: import.meta.env.VITE_APTOS_DEVNET_API_KEY || undefined,
  decibel: import.meta.env.VITE_APTOS_DECIBEL_API_KEY || undefined,
  shelbynet: import.meta.env.VITE_APTOS_SHELBYNET_API_KEY || undefined,
  local: import.meta.env.VITE_APTOS_LOCAL_API_KEY || undefined,
};

/**
 * True when the build was produced by a hosted preview deployment on either
 * Netlify (deploy-preview / branch-deploy) or Vercel (preview). API keys are
 * intentionally suppressed for these contexts because the keys are not scoped
 * to preview deployment URLs. Local development and production builds are
 * unaffected.
 */
const isHostedPreview =
  import.meta.env.VITE_NETLIFY_CONTEXT === "deploy-preview" ||
  import.meta.env.VITE_NETLIFY_CONTEXT === "branch-deploy" ||
  import.meta.env.VITE_VERCEL_CONTEXT === "preview";

/**
 * Networks that intentionally do not have a default client API key:
 * - `local`: runs against the developer's own node (no public rate limit).
 *
 * Warnings are suppressed for these networks so the console isn't spammed
 * with expected misses.
 */
const networksWithoutDefaultClientKey: ReadonlySet<NetworkName> = new Set([
  "local",
]);

const warnedNetworksMissingApiKey = new Set<NetworkName>();

/**
 * Emit a one-time `console.error` when the browser builds an Aptos client
 * without an API key for a network where we *expect* one. Each network
 * fires at most once per page session so the message is visible but doesn't
 * flood the console.
 *
 * Exposed for tests via `resetMissingApiKeyWarnings`.
 */
export function warnIfClientMissingApiKey(network_name: NetworkName): void {
  if (typeof window === "undefined") return;
  if (networksWithoutDefaultClientKey.has(network_name)) return;
  if (warnedNetworksMissingApiKey.has(network_name)) return;
  warnedNetworksMissingApiKey.add(network_name);
  // Error level so it shows up in browser devtools filters and Sentry
  // breadcrumbs — missing keys drop every browser request into the shared
  // anonymous rate-limit bucket and cause widespread 429s.
  console.error(
    `[aptos-explorer] No Aptos API key configured for network "${network_name}". ` +
      `All requests will share the anonymous rate-limit bucket and may be throttled. ` +
      `Set VITE_APTOS_${network_name.toUpperCase()}_API_KEY at build time, or add a key under Settings → API Keys.`,
  );
}

const warnedNetworksMissingServerApiKey = new Set<NetworkName>();

/**
 * Emit a one-time `console.error` on the server (SSR / Netlify Functions)
 * when `getServerApiKey` cannot find an `APTOS_<NETWORK>_API_KEY` for a
 * network that normally has one. Mirrors `warnIfClientMissingApiKey` for
 * the backend, so missing-key misconfigurations show up loudly in
 * function logs (Netlify, Sentry, etc.) instead of silently dropping
 * SSR / GraphQL traffic into the anonymous rate-limit bucket.
 *
 * Like the client warning, this fires at most once per network per
 * process so logs aren't flooded.
 */
export function warnIfServerMissingApiKey(network_name: NetworkName): void {
  if (typeof window !== "undefined") return;
  if (networksWithoutDefaultClientKey.has(network_name)) return;
  if (warnedNetworksMissingServerApiKey.has(network_name)) return;
  warnedNetworksMissingServerApiKey.add(network_name);
  console.error(
    `[aptos-explorer] No Aptos API key configured for network "${network_name}" on the server. ` +
      `SSR and proxied requests will share the anonymous rate-limit bucket and may be throttled. ` +
      `Set APTOS_${network_name.toUpperCase()}_API_KEY in the deployment environment ` +
      `(and the matching VITE_APTOS_${network_name.toUpperCase()}_API_KEY for the client bundle).`,
  );
}

/**
 * Test-only helper: clear the per-network "already warned" sets so
 * multiple test cases can observe the warning behavior independently.
 */
export function resetMissingApiKeyWarnings(): void {
  warnedNetworksMissingApiKey.clear();
  warnedNetworksMissingServerApiKey.clear();
}

/**
 * Get the client-side API key for a network.
 * This key is safe to expose in the browser (client API key).
 * Returns undefined on Netlify preview builds unless an explicit override is
 * provided by the user in the browser.
 *
 * Emits a one-time `console.error` on the client when no key is available
 * for a network that normally has one (so missing-key misconfigurations are
 * visible to operators in browser devtools).
 */
export function getApiKey(
  network_name: NetworkName,
  overrideApiKey?: string,
): string | undefined {
  const normalizedOverride = overrideApiKey?.trim();
  if (normalizedOverride) {
    return normalizedOverride;
  }

  if (isHostedPreview) {
    warnIfClientMissingApiKey(network_name);
    return undefined;
  }
  const key = clientApiKeys[network_name];
  if (!key) {
    warnIfClientMissingApiKey(network_name);
  }
  return key;
}

/**
 * Get the server-side API key for a network.
 * Reads from APTOS_<NETWORK>_API_KEY (no VITE_ prefix, never sent to browser).
 * Falls back to the client key if no server key is configured.
 * Returns undefined on Netlify preview builds (checked via the CONTEXT runtime var).
 *
 * Emits a one-time `console.error` in the server process when no server
 * key (and no client-side fallback) is available for a network that
 * normally has one, so missing-key misconfigurations surface in
 * Netlify Function logs / Sentry instead of silently shifting SSR
 * traffic into the anonymous rate-limit bucket.
 */
export function getServerApiKey(network_name: NetworkName): string | undefined {
  // Netlify sets CONTEXT at SSR function runtime; suppress keys for preview contexts.
  const netlifyContext =
    typeof process !== "undefined" ? process.env.CONTEXT : undefined;
  if (
    netlifyContext === "deploy-preview" ||
    netlifyContext === "branch-deploy"
  ) {
    warnIfServerMissingApiKey(network_name);
    return undefined;
  }

  if (typeof process !== "undefined" && process.env) {
    const envKey = `APTOS_${network_name.toUpperCase()}_API_KEY`;
    const serverKey = process.env[envKey];
    if (serverKey) return serverKey;
  }
  const fallback = clientApiKeys[network_name];
  if (!fallback) {
    warnIfServerMissingApiKey(network_name);
  }
  return fallback;
}

export function isValidNetworkName(value: string): value is NetworkName {
  return value in networks;
}

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  DECIBEL = "decibel",
  SHELBYNET = "shelbynet",
}

// Remove trailing slashes
for (const key of Object.keys(networks)) {
  const networkName = key as NetworkName;
  if (networks[networkName].endsWith("/")) {
    networks[networkName] = networks[networkName].slice(0, -1);
  }
}

export const defaultNetworkName: NetworkName = "mainnet" as const;

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

/**
 * Feature Configuration
 */
export const features = {
  prod: "Production Mode",
  dev: "Development Mode",
  earlydev: "Early Development Mode",
};

export type FeatureName = keyof typeof features;

export function isValidFeatureName(value: string): value is FeatureName {
  return value in features;
}

export const defaultFeatureName: FeatureName = "prod" as const;

/**
 * Core Constants
 */
export const OCTA = 100000000;

/**
 * Core Address Constants
 */
export const objectCoreResource = "0x1::object::ObjectCore";
export const faMetadataResource = "0x1::fungible_asset::Metadata";
export const tokenV2Address = "0x4::token::Token";
export const collectionV2Address = "0x4::collection::Collection";

/**
 * GraphQL Endpoints
 */
export function getGraphqlURI(networkName: NetworkName): string | undefined {
  switch (networkName) {
    case "mainnet":
      return "https://api.mainnet.aptoslabs.com/v1/graphql";
    case "testnet":
      return "https://api.testnet.staging.aptoslabs.com/v1/graphql";
    case "devnet":
      return "https://api.devnet.staging.aptoslabs.com/v1/graphql";
    case "decibel":
      return "https://api.netna.aptoslabs.com/v1/graphql";
    case "shelbynet":
      return "https://api.shelbynet.staging.shelby.xyz/v1/graphql";
    case "local":
      return "http://127.0.0.1:8090/v1/graphql";
    default:
      return undefined;
  }
}

/**
 * SEO Constants
 */
export const DEFAULT_DESCRIPTION =
  "Explore transactions, accounts, events, nodes, gas fees and other network activity within the Aptos Network.";
export const DEFAULT_OG_IMAGE = "https://explorer.aptoslabs.com/og-image.png";
export const BASE_URL = "https://explorer.aptoslabs.com";
