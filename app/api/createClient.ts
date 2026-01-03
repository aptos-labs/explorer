/**
 * Create Aptos client for route loaders.
 * Used to create a client based on network from URL search params or cookies.
 */
import {Aptos, AptosConfig, Network as SdkNetwork} from "@aptos-labs/ts-sdk";
import Cookies from "js-cookie";
import {
  networks,
  defaultNetworkName,
  NetworkName,
  getApiKey,
  isValidNetworkName,
  getGraphqlURI,
} from "../lib/constants";

const NETWORK_COOKIE_NAME = "network";

/**
 * Get network name from search params or cookies.
 */
export function getNetworkFromSearch(
  search: Record<string, string | undefined>,
): NetworkName {
  // Check URL search param first
  if (search?.network && isValidNetworkName(search.network)) {
    return search.network;
  }

  // Fall back to cookie
  if (typeof window !== "undefined") {
    const cookie = Cookies.get(NETWORK_COOKIE_NAME);
    if (cookie && isValidNetworkName(cookie)) {
      return cookie;
    }
  }

  return defaultNetworkName;
}

/**
 * Create an Aptos v2 client for the given network.
 */
export function createAptosClient(networkName: NetworkName): Aptos {
  const nodeUrl = networks[networkName];
  const apiKey = getApiKey(networkName);
  const indexerUri = getGraphqlURI(networkName);

  // Map network name to SDK Network enum
  let network: SdkNetwork;
  switch (networkName) {
    case "mainnet":
      network = SdkNetwork.MAINNET;
      break;
    case "testnet":
      network = SdkNetwork.TESTNET;
      break;
    case "devnet":
      network = SdkNetwork.DEVNET;
      break;
    default:
      network = SdkNetwork.CUSTOM;
  }

  const config = new AptosConfig({
    network,
    fullnode: nodeUrl,
    indexer: indexerUri,
    clientConfig: apiKey
      ? {
          HEADERS: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      : undefined,
  });

  return new Aptos(config);
}

// Cache clients to avoid recreating them
const clientCache = new Map<NetworkName, Aptos>();

/**
 * Get a cached Aptos client for the given network.
 */
export function getCachedClient(networkName: NetworkName): Aptos {
  if (!clientCache.has(networkName)) {
    clientCache.set(networkName, createAptosClient(networkName));
  }
  return clientCache.get(networkName)!;
}

/**
 * Get an Aptos client from route search params.
 * Useful in route loaders.
 */
export function getClientFromSearch(
  search: Record<string, string | undefined>,
): Aptos {
  const networkName = getNetworkFromSearch(search);
  return getCachedClient(networkName);
}
