/**
 * Network Configuration
 */

/**
 * Check if the app is running on a Netlify preview/branch deployment.
 * These deployments need to use the API proxy to avoid CORS issues since
 * the Aptos API servers don't include preview origins in their CORS policy.
 */
function isNetlifyPreviewDeployment(): boolean {
  if (typeof window === "undefined") {
    // During SSR, check for Netlify environment variable
    // CONTEXT is "deploy-preview" or "branch-deploy" for non-production builds
    const context = process.env.CONTEXT;
    return context === "deploy-preview" || context === "branch-deploy";
  }
  // Client-side: check if hostname matches Netlify preview pattern
  // e.g., deploy-preview-123--site-name.netlify.app or branch-name--site-name.netlify.app
  const hostname = window.location.hostname;
  return (
    hostname.includes(".netlify.app") && !hostname.startsWith("aptos-explorer")
  );
}

/**
 * Get the API URL for a network, using proxy on Netlify preview deployments.
 */
function getNetworkUrl(
  network: string,
  directUrl: string,
  proxyPath: string,
): string {
  if (isNetlifyPreviewDeployment()) {
    // Use relative proxy URL on preview deployments
    return proxyPath;
  }
  return directUrl;
}

export const devnetUrl =
  import.meta.env.APTOS_DEVNET_URL ||
  "https://api.devnet.staging.aptoslabs.com/v1";

// Direct API URLs (used in production)
const directNetworks: Record<string, string> = {
  mainnet: "https://api.mainnet.aptoslabs.com/v1",
  testnet: "https://api.testnet.staging.aptoslabs.com/v1",
  devnet: devnetUrl,
  decibel: "https://api.netna.aptoslabs.com/v1",
  shelbynet: "https://api.shelbynet.staging.shelby.xyz/v1",
  local: "http://127.0.0.1:8080/v1",
};

// Proxy paths for preview deployments (relative URLs)
const proxyPaths: Record<string, string> = {
  mainnet: "/api-proxy/mainnet",
  testnet: "/api-proxy/testnet",
  devnet: "/api-proxy/devnet",
  decibel: "/api-proxy/decibel",
  shelbynet: "/api-proxy/shelbynet",
  local: "http://127.0.0.1:8080/v1", // Local always uses direct connection
};

// Type for network names (based on directNetworks keys)
export type NetworkName = keyof typeof directNetworks;

/**
 * Get the network URL for a given network name.
 * On preview deployments, returns the proxy URL; otherwise returns the direct URL.
 */
export function getNetworkApiUrl(networkName: NetworkName): string {
  const directUrl = directNetworks[networkName];
  const proxyPath = proxyPaths[networkName];
  return getNetworkUrl(networkName, directUrl, proxyPath);
}

// Export networks object that dynamically resolves URLs based on deployment context
// Uses a Proxy to intercept property access and return proxied URLs on preview deployments
export const networks: Record<NetworkName, string> = new Proxy(
  directNetworks as Record<NetworkName, string>,
  {
    get(target, prop: string) {
      if (prop in target) {
        const networkName = prop as NetworkName;
        return getNetworkUrl(
          networkName,
          target[networkName],
          proxyPaths[networkName] || target[networkName],
        );
      }
      return undefined;
    },
    // Support Object.keys() and 'in' operator
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    has(target, prop) {
      return Reflect.has(target, prop);
    },
  },
);

export const hiddenNetworks: readonly NetworkName[] = [
  "decibel",
  "shelbynet",
] as const;

type ApiKeys = {
  [key in NetworkName]: string | undefined;
};

/**
 * Public Client IDs (API keys) from API Gateway
 * These can be overridden via environment variables (VITE_APTOS_<NETWORK>_API_KEY)
 */
const apiKeys: ApiKeys = {
  mainnet: import.meta.env.VITE_APTOS_MAINNET_API_KEY,
  testnet: import.meta.env.VITE_APTOS_TESTNET_API_KEY,
  devnet: import.meta.env.VITE_APTOS_DEVNET_API_KEY,
  decibel: import.meta.env.VITE_APTOS_DECIBEL_API_KEY,
  shelbynet:
    import.meta.env.VITE_APTOS_SHELBYNET_API_KEY ||
    "AG-MGQQAXV57YJVDQANQPBQDFJVFMUY912EC",
  local: import.meta.env.VITE_APTOS_LOCAL_API_KEY || undefined,
};

export function getApiKey(network_name: NetworkName): string | undefined {
  return apiKeys[network_name];
}

export function isValidNetworkName(value: string): value is NetworkName {
  return value in directNetworks;
}

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  DECIBEL = "decibel",
  SHELBYNET = "shelbynet",
}

// Remove trailing slashes from direct URLs (done once at module load)
for (const key of Object.keys(directNetworks)) {
  const networkName = key as NetworkName;
  if (directNetworks[networkName].endsWith("/")) {
    directNetworks[networkName] = directNetworks[networkName].slice(0, -1);
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

// Direct GraphQL URLs (used in production)
const directGraphqlUrls: Record<string, string> = {
  mainnet: "https://api.mainnet.aptoslabs.com/v1/graphql",
  testnet: "https://api.testnet.staging.aptoslabs.com/v1/graphql",
  devnet: "https://api.devnet.staging.aptoslabs.com/v1/graphql",
  decibel: "https://api.netna.aptoslabs.com/v1/graphql",
  shelbynet: "https://api.shelbynet.staging.shelby.xyz/v1/graphql",
  local: "http://127.0.0.1:8090/v1/graphql",
};

// Proxy paths for GraphQL on preview deployments
const graphqlProxyPaths: Record<string, string> = {
  mainnet: "/graphql-proxy/mainnet",
  testnet: "/graphql-proxy/testnet",
  devnet: "/graphql-proxy/devnet",
  decibel: "/graphql-proxy/decibel",
  shelbynet: "/graphql-proxy/shelbynet",
  local: "http://127.0.0.1:8090/v1/graphql", // Local always uses direct connection
};

export function getGraphqlURI(networkName: NetworkName): string | undefined {
  const directUrl = directGraphqlUrls[networkName];
  if (!directUrl) {
    return undefined;
  }

  if (isNetlifyPreviewDeployment()) {
    return graphqlProxyPaths[networkName] || directUrl;
  }

  return directUrl;
}

/**
 * SEO Constants
 */
export const DEFAULT_DESCRIPTION =
  "Explore transactions, accounts, events, nodes, gas fees and other network activity within the Aptos Network.";
export const DEFAULT_OG_IMAGE = "https://explorer.aptoslabs.com/og-image.png";
export const BASE_URL = "https://explorer.aptoslabs.com";
