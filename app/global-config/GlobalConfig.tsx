import React, {createContext, useContext, useMemo, ReactNode} from "react";
import {AptosClient, IndexerClient} from "aptos";
import {Aptos, AptosConfig, Network as SdkNetwork} from "@aptos-labs/ts-sdk";
import {useSearch, useLocation, useNavigate} from "@tanstack/react-router";
import {
  networks,
  defaultNetworkName,
  NetworkName,
  getApiKey,
  isValidNetworkName,
  getGraphqlURI,
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
    Cookies.set(NETWORK_COOKIE_NAME, name, {
      expires: 365,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });
  }
}

interface GlobalConfigProviderProps {
  children: ReactNode;
}

export function GlobalConfigProvider({children}: GlobalConfigProviderProps) {
  // Get network from URL search params (takes priority)
  const search = useSearch({strict: false}) as {network?: string};
  const location = useLocation();
  const navigate = useNavigate();

  // URL param network (if valid)
  const networkFromUrl =
    search?.network && isValidNetworkName(search.network)
      ? search.network
      : null;

  // User's saved preference from cookie
  const [savedNetworkName, setSavedNetworkName] = React.useState<NetworkName>(
    () => getNetworkNameFromCookie(),
  );

  // Sync cookie with URL param when URL has a valid network
  // This ensures the cookie stays in sync for hidden networks accessed via URL
  React.useEffect(() => {
    if (networkFromUrl && networkFromUrl !== savedNetworkName) {
      setSavedNetworkName(networkFromUrl);
      setNetworkNameCookie(networkFromUrl);
    }
  }, [networkFromUrl, savedNetworkName]);

  // URL param takes priority, falls back to saved preference
  const networkName = networkFromUrl ?? savedNetworkName;

  // Always ensure network param is in the URL for easy link sharing
  // This runs client-side only and uses replace to avoid adding history entries
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // If no network param in URL, add it
    if (!networkFromUrl) {
      const currentSearch = new URLSearchParams(window.location.search);
      currentSearch.set("network", networkName);

      navigate({
        to: location.pathname,
        search: Object.fromEntries(currentSearch.entries()),
        replace: true,
      });
    }
  }, [networkFromUrl, networkName, location.pathname, navigate]);

  const setNetworkName = React.useCallback((name: NetworkName) => {
    setSavedNetworkName(name);
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

// Default headers for indexer requests
const INDEXER_HEADERS = {
  "x-indexer-client": "aptos-explorer",
};

// IndexerClient cache
const indexerClientCache = new Map<string, IndexerClient>();

function createIndexerClient(
  networkName: NetworkName,
): IndexerClient | undefined {
  const indexerUri = getGraphqlURI(networkName);
  const apiKey = getApiKey(networkName);

  if (!indexerUri) {
    return undefined;
  }

  return new IndexerClient(indexerUri, {
    HEADERS: INDEXER_HEADERS,
    TOKEN: apiKey,
  });
}

function getCachedIndexerClient(
  networkName: NetworkName,
): IndexerClient | undefined {
  if (!indexerClientCache.has(networkName)) {
    const client = createIndexerClient(networkName);
    if (client) {
      indexerClientCache.set(networkName, client);
    }
  }
  return indexerClientCache.get(networkName);
}

/**
 * Hook to get an indexer client.
 * Returns the legacy IndexerClient from the aptos package for GraphQL queries.
 */
export function useIndexerClient(): IndexerClient | undefined {
  const networkName = useNetworkName();
  return useMemo(() => getCachedIndexerClient(networkName), [networkName]);
}

/**
 * Hook to get the feature name from environment or cookie.
 */
export function useFeatureName(): string {
  // Default to "prod" - can be enhanced to read from cookie/env
  return "prod";
}
