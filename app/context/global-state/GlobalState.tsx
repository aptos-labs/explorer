import React, {useMemo, createContext, useContext} from "react";
import {useSearch} from "@tanstack/react-router";
import {Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import {
  NetworkName,
  networks,
  defaultNetworkName,
  isValidNetworkName,
  getApiKey,
  getGraphqlURI,
} from "../../lib/constants";

const HEADERS = {
  "x-indexer-client": "aptos-explorer",
};

export type GlobalState = {
  /** derived from external state ?network=<network> query parameter - e.g. devnet */
  readonly network_name: NetworkName;
  /** derived from network_name - url to connect to network */
  readonly network_value: string;
  /** derived from network_value */
  readonly sdk_v2_client: Aptos;
};

// Cache for client instances to prevent unnecessary recreations
const clientCache = new Map<string, Aptos>();

// Map network name to SDK Network enum
function getNetworkEnum(networkName: NetworkName): Network {
  switch (networkName) {
    case "mainnet":
      return Network.MAINNET;
    case "testnet":
      return Network.TESTNET;
    case "devnet":
      return Network.DEVNET;
    default:
      return Network.CUSTOM;
  }
}

function getCachedClient(
  network_name: NetworkName,
  network_value: string,
): Aptos {
  const cacheKey = network_name;

  if (!clientCache.has(cacheKey)) {
    const indexerUri = getGraphqlURI(network_name);
    const apiKey = getApiKey(network_name);

    const client = new Aptos(
      new AptosConfig({
        network: getNetworkEnum(network_name),
        fullnode: network_value,
        indexer: indexerUri,
        clientConfig: {
          HEADERS,
          API_KEY: apiKey,
        },
      }),
    );

    clientCache.set(cacheKey, client);
  }

  return clientCache.get(cacheKey)!;
}

function deriveGlobalState(network_name: NetworkName): GlobalState {
  const network_value = networks[network_name];
  const sdk_v2_client = getCachedClient(network_name, network_value);

  return {
    network_name,
    network_value,
    sdk_v2_client,
  };
}

const GlobalStateContext = createContext<GlobalState | null>(null);

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Get network from URL search params
  const search = useSearch({strict: false}) as {network?: string};

  const networkName = useMemo(() => {
    if (search?.network && isValidNetworkName(search.network)) {
      return search.network;
    }
    return defaultNetworkName;
  }, [search?.network]);

  const globalState = useMemo(
    () => deriveGlobalState(networkName),
    [networkName],
  );

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): GlobalState => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within GlobalStateProvider");
  }
  return context;
};

/**
 * Hook to get only the network name
 * Component will only re-render when network_name changes
 */
export const useNetworkName = (): NetworkName => {
  const state = useGlobalState();
  return state.network_name;
};

/**
 * Hook to get only the network value (URL)
 * Component will only re-render when network_value changes
 */
export const useNetworkValue = (): string => {
  const state = useGlobalState();
  return state.network_value;
};

/**
 * Hook to get only the SDK v2 client
 * Component will only re-render when sdk_v2_client changes (should be rare due to caching)
 */
export const useSdkV2Client = (): Aptos => {
  const state = useGlobalState();
  return state.sdk_v2_client;
};
