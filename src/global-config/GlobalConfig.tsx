import {AptosClient, IndexerClient} from "aptos";
import React, {useMemo} from "react";
import {
  FeatureName,
  NetworkName,
  defaultNetworkName,
  getApiKey,
  networks,
} from "../constants";
import {
  getSelectedFeatureFromLocalStorage,
  useFeatureSelector,
} from "./feature-selection";
import {useNetworkSelector} from "./network-selection";
import {getGraphqlURI} from "../api/hooks/useGraphqlClient";
import {
  Aptos,
  AptosConfig,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";

const HEADERS = {
  "x-indexer-client": "aptos-explorer",
};

export type GlobalState = {
  /** actual state */
  readonly feature_name: FeatureName;
  /** derived from external state ?network=<network> query parameter - e.g. devnet */
  readonly network_name: NetworkName;
  /** derived from network_name - url to connect to network */
  readonly network_value: string;
  /** derived from network_value */
  readonly aptos_client: AptosClient;
  /** derived from network_value */
  readonly indexer_client?: IndexerClient;
  /** derived from network_value */
  readonly sdk_v2_client: Aptos;
};

type GlobalActions = {
  selectFeature: ReturnType<typeof useFeatureSelector>[1];
  selectNetwork: ReturnType<typeof useNetworkSelector>[1];
};

// Cache for client instances to prevent unnecessary recreations
const clientCache = new Map<
  string,
  {
    aptos_client: AptosClient;
    indexer_client?: IndexerClient;
    sdk_v2_client: Aptos;
  }
>();

function getCachedClients(network_name: NetworkName, network_value: string) {
  const cacheKey = network_name;

  if (!clientCache.has(cacheKey)) {
    const indexerUri = getGraphqlURI(network_name);
    const apiKey = getApiKey(network_name);

    let indexerClient: IndexerClient | undefined;
    if (indexerUri) {
      indexerClient = new IndexerClient(indexerUri, {HEADERS, TOKEN: apiKey});
    }

    const clients = {
      aptos_client: new AptosClient(network_value, {
        HEADERS,
        TOKEN: apiKey,
      }),
      indexer_client: indexerClient,
      sdk_v2_client: new Aptos(
        new AptosConfig({
          network: NetworkToNetworkName[network_name] ?? Network.CUSTOM,
          fullnode: network_value,
          indexer: indexerUri,
          clientConfig: {
            HEADERS,
            API_KEY: apiKey,
          },
        }),
      ),
    };

    clientCache.set(cacheKey, clients);
  }

  return clientCache.get(cacheKey)!;
}

function deriveGlobalState({
  feature_name,
  network_name,
}: {
  feature_name: FeatureName;
  network_name: NetworkName;
}): GlobalState {
  const network_value = networks[network_name];
  const clients = getCachedClients(network_name, network_value);

  return {
    feature_name,
    network_name,
    network_value,
    ...clients,
  };
}

const initialGlobalState = deriveGlobalState({
  feature_name: getSelectedFeatureFromLocalStorage(),
  network_name: defaultNetworkName,
});

export const GlobalStateContext = React.createContext(initialGlobalState);
export const GlobalActionsContext = React.createContext({} as GlobalActions);

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedFeature, selectFeature] = useFeatureSelector();
  const [selectedNetwork, selectNetwork] = useNetworkSelector();
  const globalState: GlobalState = useMemo(
    () =>
      deriveGlobalState({
        feature_name: selectedFeature,
        network_name: selectedNetwork,
      }),
    [selectedFeature, selectedNetwork],
  );

  const globalActions = useMemo(
    () => ({
      selectFeature,
      selectNetwork,
    }),
    [selectFeature, selectNetwork],
  );

  return (
    <GlobalStateContext.Provider value={globalState}>
      <GlobalActionsContext.Provider value={globalActions}>
        {children}
      </GlobalActionsContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () =>
  [
    React.useContext(GlobalStateContext),
    React.useContext(GlobalActionsContext),
  ] as const;

// Selective hooks for components that only need specific parts of the state
// These prevent unnecessary re-renders when other parts of state change

/**
 * Hook to get only the network name
 * Component will only re-render when network_name changes
 */
export const useNetworkName = (): NetworkName => {
  const [state] = useGlobalState();
  return state.network_name;
};

/**
 * Hook to get only the feature name
 * Component will only re-render when feature_name changes
 */
export const useFeatureName = (): FeatureName => {
  const [state] = useGlobalState();
  return state.feature_name;
};

/**
 * Hook to get only the network value (URL)
 * Component will only re-render when network_value changes
 */
export const useNetworkValue = (): string => {
  const [state] = useGlobalState();
  return state.network_value;
};

/**
 * Hook to get only the AptosClient
 * Component will only re-render when aptos_client changes (should be rare due to caching)
 */
export const useAptosClient = (): AptosClient => {
  const [state] = useGlobalState();
  return state.aptos_client;
};

/**
 * Hook to get only the IndexerClient
 * Component will only re-render when indexer_client changes
 */
export const useIndexerClient = (): IndexerClient | undefined => {
  const [state] = useGlobalState();
  return state.indexer_client;
};

/**
 * Hook to get only the SDK v2 client
 * Component will only re-render when sdk_v2_client changes (should be rare due to caching)
 */
export const useSdkV2Client = (): Aptos => {
  const [state] = useGlobalState();
  return state.sdk_v2_client;
};

/**
 * Hook to get only the actions
 * Component will only re-render when actions change (should never happen)
 */
export const useGlobalActions = (): GlobalActions => {
  return React.useContext(GlobalActionsContext);
};
