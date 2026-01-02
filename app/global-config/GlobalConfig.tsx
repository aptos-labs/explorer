import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
} from "react";
import {AptosClient} from "aptos";
import {Aptos, AptosConfig, Network as SdkNetwork} from "@aptos-labs/ts-sdk";
import {useSearch} from "@tanstack/react-router";
import {
  networks,
  defaultNetworkName,
  NetworkName,
  getApiKey,
  isValidNetworkName,
} from "../constants";
import Cookies from "js-cookie";

const NETWORK_COOKIE_NAME = "network";

// Network context
interface GlobalContextValue {
  networkName: NetworkName;
  setNetworkName: (name: NetworkName) => void;
}

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

function getNetworkNameFromCookie(): NetworkName {
  if (typeof window === "undefined") return defaultNetworkName;
  const cookie = Cookies.get(NETWORK_COOKIE_NAME);
  if (cookie && cookie in networks) {
    return cookie as NetworkName;
  }
  return defaultNetworkName;
}

function setNetworkNameCookie(name: NetworkName) {
  if (typeof window !== "undefined") {
    Cookies.set(NETWORK_COOKIE_NAME, name, {expires: 365});
  }
}

interface GlobalConfigProviderProps {
  children: ReactNode;
}

export function GlobalConfigProvider({children}: GlobalConfigProviderProps) {
  // Get network from URL search params (takes priority)
  const search = useSearch({strict: false}) as {network?: string};

  const [networkName, setNetworkNameState] = React.useState<NetworkName>(() => {
    // URL param takes priority over cookie
    if (search?.network && isValidNetworkName(search.network)) {
      return search.network;
    }
    return getNetworkNameFromCookie();
  });

  // Update network when URL param changes
  useEffect(() => {
    if (search?.network && isValidNetworkName(search.network)) {
      setNetworkNameState(search.network);
    }
  }, [search?.network]);

  const setNetworkName = React.useCallback((name: NetworkName) => {
    setNetworkNameState(name);
    setNetworkNameCookie(name);
  }, []);

  const value = useMemo(
    () => ({
      networkName,
      setNetworkName,
    }),
    [networkName, setNetworkName],
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalConfigProvider",
    );
  }
  return context;
}

// Network hooks
export function useNetworkName(): NetworkName {
  const {networkName} = useGlobalContext();
  return networkName;
}

export function useNetworkSelector(): [
  NetworkName,
  (name: NetworkName) => void,
] {
  const {networkName, setNetworkName} = useGlobalContext();
  return [networkName, setNetworkName];
}

export function useNetworkValue(): string {
  const networkName = useNetworkName();
  return networks[networkName];
}

// Create Aptos clients
function createAptosClient(networkName: NetworkName): AptosClient {
  const nodeUrl = networks[networkName];
  const apiKey = getApiKey(networkName);
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  return new AptosClient(nodeUrl, {HEADERS: headers});
}

function createAptosV2Client(networkName: NetworkName): Aptos {
  const nodeUrl = networks[networkName];
  const apiKey = getApiKey(networkName);

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

// Client cache to prevent unnecessary recreations
const clientCache = new Map<string, Aptos>();

function getCachedV2Client(networkName: NetworkName): Aptos {
  if (!clientCache.has(networkName)) {
    clientCache.set(networkName, createAptosV2Client(networkName));
  }
  return clientCache.get(networkName)!;
}

// Aptos client hooks
export function useAptosClient(): AptosClient {
  const networkName = useNetworkName();
  return useMemo(() => createAptosClient(networkName), [networkName]);
}

export function useAptosClientV2(): Aptos {
  const networkName = useNetworkName();
  return useMemo(() => getCachedV2Client(networkName), [networkName]);
}

// Legacy-compatible GlobalState interface
export type GlobalState = {
  readonly network_name: NetworkName;
  readonly network_value: string;
  readonly sdk_v2_client: Aptos;
};

/**
 * Legacy hook for compatibility with existing code.
 * Returns the full global state object.
 */
export function useGlobalState(): GlobalState {
  const networkName = useNetworkName();
  const networkValue = networks[networkName];
  const sdk_v2_client = useMemo(
    () => getCachedV2Client(networkName),
    [networkName],
  );

  return useMemo(
    () => ({
      network_name: networkName,
      network_value: networkValue,
      sdk_v2_client,
    }),
    [networkName, networkValue, sdk_v2_client],
  );
}

/**
 * Hook to get the SDK v2 client directly.
 * This is an alias for useAptosClientV2() for backward compatibility.
 */
export function useSdkV2Client(): Aptos {
  return useAptosClientV2();
}

/**
 * Hook to get an indexer client.
 * For now, this returns the SDK v2 client which has indexer functionality built in.
 */
export function useIndexerClient(): Aptos {
  return useAptosClientV2();
}

/**
 * Hook to get the feature name from environment or cookie.
 */
export function useFeatureName(): string {
  // Default to "prod" - can be enhanced to read from cookie/env
  return "prod";
}
