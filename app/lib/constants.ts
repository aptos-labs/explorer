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
 */
const clientApiKeys: ApiKeys = {
  mainnet: import.meta.env.VITE_APTOS_MAINNET_API_KEY,
  testnet: import.meta.env.VITE_APTOS_TESTNET_API_KEY,
  devnet: import.meta.env.VITE_APTOS_DEVNET_API_KEY,
  decibel: import.meta.env.VITE_APTOS_DECIBEL_API_KEY,
  shelbynet: import.meta.env.VITE_APTOS_SHELBYNET_API_KEY,
  local: import.meta.env.VITE_APTOS_LOCAL_API_KEY || undefined,
};

/**
 * True when the build was produced by a Netlify preview deployment (deploy-preview
 * or branch-deploy context). API keys are intentionally suppressed for these
 * contexts because the keys are not scoped to preview deployment URLs.
 * Local development and production builds are unaffected.
 */
const isNetlifyPreview =
  import.meta.env.VITE_NETLIFY_CONTEXT === "deploy-preview" ||
  import.meta.env.VITE_NETLIFY_CONTEXT === "branch-deploy";

/**
 * Get the client-side API key for a network.
 * This key is safe to expose in the browser (client API key).
 * Returns undefined on Netlify preview builds.
 */
export function getApiKey(
  network_name: NetworkName,
  overrideApiKey?: string,
): string | undefined {
  const normalizedOverride = overrideApiKey?.trim();
  if (normalizedOverride) {
    return normalizedOverride;
  }

  if (isNetlifyPreview) return undefined;
  return clientApiKeys[network_name];
}

/**
 * Get the server-side API key for a network.
 * Reads from APTOS_<NETWORK>_API_KEY (no VITE_ prefix, never sent to browser).
 * Falls back to the client key if no server key is configured.
 * Returns undefined on Netlify preview builds (checked via the CONTEXT runtime var).
 */
export function getServerApiKey(network_name: NetworkName): string | undefined {
  // Netlify sets CONTEXT at SSR function runtime; suppress keys for preview contexts.
  const netlifyContext =
    typeof process !== "undefined" ? process.env.CONTEXT : undefined;
  if (
    netlifyContext === "deploy-preview" ||
    netlifyContext === "branch-deploy"
  ) {
    return undefined;
  }

  if (typeof process !== "undefined" && process.env) {
    const envKey = `APTOS_${network_name.toUpperCase()}_API_KEY`;
    const serverKey = process.env[envKey];
    if (serverKey) return serverKey;
  }
  return clientApiKeys[network_name];
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
