import {getGraphqlURI, type NetworkName, networks} from "./constants";

/**
 * Public Aptos Labs REST hosts (the TS SDK defaults). Testnet and devnet in
 * the explorer stay on the staging hosts until Settings opts in.
 */
export const PUBLIC_FULLNODE_URLS: Partial<Record<NetworkName, string>> = {
  testnet: "https://api.testnet.aptoslabs.com/v1",
  devnet: "https://api.devnet.aptoslabs.com/v1",
};

/** Staging hosts the explorer uses for testnet and devnet by default. */
export const STAGING_FULLNODE_URLS: Partial<Record<NetworkName, string>> = {
  testnet: "https://api.testnet.staging.aptoslabs.com/v1",
  devnet: "https://api.devnet.staging.aptoslabs.com/v1",
};

/**
 * Module flag set during render after hydration. Non-React callers (cached
 * SDK clients, query functions) read this so they follow the same host the
 * current render selected. Stays false on the server and on the first client
 * render, which keeps SSR HTML aligned with that first paint.
 */
let clientAppliedNonStaging = false;

export function setClientAppliedNonStagingEndpoints(enabled: boolean): void {
  clientAppliedNonStaging = enabled;
}

export function getClientAppliedNonStagingEndpoints(): boolean {
  if (typeof window === "undefined") return false;
  return clientAppliedNonStaging;
}

/** Test helper. */
export function resetClientAppliedNonStagingEndpoints(): void {
  clientAppliedNonStaging = false;
}

/**
 * The first client render stays on the default (staging) hosts so it matches
 * SSR. After hydration, a saved preference can select the public hosts.
 */
export function appliedNonStagingEndpoints(
  enabled: boolean,
  hydrated: boolean,
): boolean {
  return hydrated && enabled;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Fullnode REST URL for `networkName`. When `useNonStagingEndpoints` is set,
 * testnet and devnet swap off the known staging host onto the public Aptos
 * Labs host. Mainnet, other networks, and a build-time URL that is not the
 * staging default stay as configured.
 */
export function resolveFullnodeUrl(
  networkName: NetworkName,
  useNonStagingEndpoints: boolean,
  configuredUrl: string = networks[networkName],
): string {
  const configured = stripTrailingSlash(configuredUrl);
  if (!useNonStagingEndpoints) return configured;
  const staging = STAGING_FULLNODE_URLS[networkName];
  const pub = PUBLIC_FULLNODE_URLS[networkName];
  if (!staging || !pub) return configured;
  if (configured !== staging) return configured;
  return pub;
}

/**
 * Indexer GraphQL URL. Swaps with the fullnode only when testnet or devnet
 * is still on the default staging REST host and the indexer is still the
 * matching staging GraphQL URL.
 */
export function resolveGraphqlURI(
  networkName: NetworkName,
  useNonStagingEndpoints: boolean,
  configuredGraphql: string | undefined = getGraphqlURI(networkName),
  configuredFullnode: string = networks[networkName],
): string | undefined {
  if (!configuredGraphql) return configuredGraphql;
  if (!useNonStagingEndpoints) return configuredGraphql;
  const staging = STAGING_FULLNODE_URLS[networkName];
  const pub = PUBLIC_FULLNODE_URLS[networkName];
  if (!staging || !pub) return configuredGraphql;
  if (stripTrailingSlash(configuredFullnode) !== staging) {
    return configuredGraphql;
  }
  const stagingGraphql = `${staging}/graphql`;
  if (stripTrailingSlash(configuredGraphql) !== stagingGraphql) {
    return configuredGraphql;
  }
  return `${pub}/graphql`;
}
