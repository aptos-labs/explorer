import {Aptos, AptosConfig, Network as SdkNetwork} from "@aptos-labs/ts-sdk";
import {useSearch} from "@tanstack/react-router";
import Cookies from "js-cookie";
import React, {createContext, type ReactNode, useContext, useMemo} from "react";
import {AptosClient} from "../api/legacyClient";
import {
  defaultNetworkName,
  getApiKey,
  getGraphqlURI,
  isValidNetworkName,
  type NetworkName,
  networks,
} from "../constants";
import {getGeomiDevApiKeyOverride, useExplorerSettings} from "../settings";

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
  const isServer = typeof window === "undefined";

  // Get network from URL search params (takes priority)
  const search = useSearch({strict: false}) as {network?: string};

  // URL param network (if valid)
  // Note: "local" network only works client-side - server can't reach user's localhost
  const networkFromUrl =
    search?.network && isValidNetworkName(search.network)
      ? search.network === "local" && isServer
        ? null // Don't use local network on server
        : search.network
      : null;

  // User's saved preference from cookie
  const [savedNetworkName, setSavedNetworkName] = React.useState<NetworkName>(
    () => getNetworkNameFromCookie(),
  );

  // Track if we've already added the network param to prevent infinite loops
  const hasAddedNetworkParam = React.useRef(false);

  // Sync cookie with URL param when URL has a valid network
  // This ensures the cookie stays in sync for hidden networks accessed via URL
  React.useEffect(() => {
    if (networkFromUrl && networkFromUrl !== savedNetworkName) {
      setSavedNetworkName(networkFromUrl);
      setNetworkNameCookie(networkFromUrl);
    }
  }, [networkFromUrl, savedNetworkName]);

  // URL param takes priority, falls back to saved preference
  // On server, if the intended network is "local", fall back to default for SSR
  // Client will reconnect to local after hydration
  const intendedNetwork = networkFromUrl ?? savedNetworkName;
  const networkName =
    intendedNetwork === "local" && isServer
      ? defaultNetworkName
      : intendedNetwork;

  // Always ensure network param is in the URL for easy link sharing
  // Uses window.history.replaceState to avoid router re-renders and infinite loops
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // If network param is already in URL, reset the guard for future navigations
    if (networkFromUrl) {
      hasAddedNetworkParam.current = false;
      return;
    }

    // Guard against adding network param multiple times
    if (hasAddedNetworkParam.current) return;

    // Add network param to URL
    const url = new URL(window.location.href);
    url.searchParams.set("network", networkName);
    window.history.replaceState(null, "", url.toString());
    hasAddedNetworkParam.current = true;
  }, [networkFromUrl, networkName]);

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
function createAptosClient(
  networkName: NetworkName,
  apiKeyOverride = getGeomiDevApiKeyOverride(),
): AptosClient {
  const nodeUrl = networks[networkName];
  const apiKey = getApiKey(networkName, apiKeyOverride);
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return new AptosClient(nodeUrl, {HEADERS: headers});
}

function createAptosV2Client(
  networkName: NetworkName,
  apiKeyOverride = getGeomiDevApiKeyOverride(),
): Aptos {
  const nodeUrl = networks[networkName];
  const apiKey = getApiKey(networkName, apiKeyOverride);
  const indexerUrl = getGraphqlURI(networkName);

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
    indexer: indexerUrl,
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

function getClientCacheKey(networkName: NetworkName, apiKeyOverride?: string) {
  return `${networkName}:${apiKeyOverride?.trim() ?? ""}`;
}

export function clearCachedV2Clients() {
  clientCache.clear();
}

export function getCachedV2Client(
  networkName: NetworkName,
  apiKeyOverride = getGeomiDevApiKeyOverride(),
): Aptos {
  const cacheKey = getClientCacheKey(networkName, apiKeyOverride);
  const existing = clientCache.get(cacheKey);
  if (existing) return existing;
  const client = createAptosV2Client(networkName, apiKeyOverride);
  clientCache.set(cacheKey, client);
  return client;
}

// Aptos client hooks
export function useAptosClient(): AptosClient {
  const networkName = useNetworkName();
  const {
    settings: {geomiDevApiKeyOverride},
  } = useExplorerSettings();

  return useMemo(
    () => createAptosClient(networkName, geomiDevApiKeyOverride),
    [networkName, geomiDevApiKeyOverride],
  );
}

export function useAptosClientV2(): Aptos {
  const networkName = useNetworkName();
  const {
    settings: {geomiDevApiKeyOverride},
  } = useExplorerSettings();

  return useMemo(
    () => getCachedV2Client(networkName, geomiDevApiKeyOverride),
    [networkName, geomiDevApiKeyOverride],
  );
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
  const {
    settings: {geomiDevApiKeyOverride},
  } = useExplorerSettings();
  const sdk_v2_client = useMemo(
    () => getCachedV2Client(networkName, geomiDevApiKeyOverride),
    [networkName, geomiDevApiKeyOverride],
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
 * Hook to get the feature name from environment or cookie.
 */
export function useFeatureName(): string {
  // Default to "prod" - can be enhanced to read from cookie/env
  return "prod";
}
