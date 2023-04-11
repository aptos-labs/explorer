import {AptosClient} from "aptos";
import React, {useMemo} from "react";
import {
  FeatureName,
  NetworkName,
  defaultNetworkName,
  networks,
} from "../constants";
import {
  safeGetSelectedFeatureName,
  useFeatureSelector,
} from "./feature-selection";
import {useNetworkSelector} from "./network-selection";

export type GlobalState = {
  /** actual state */
  readonly feature_name: FeatureName;
  /** derived from external state ?network=<network> query parameter - e.g. devnet */
  readonly network_name: NetworkName;
  /** derived from network_name - url to connect to network */
  readonly network_value: string;
  /** derived from network_value */
  readonly aptos_client: AptosClient;
};

type GlobalActions = {
  selectFeature: ReturnType<typeof useFeatureSelector>[1];
  selectNetwork: ReturnType<typeof useNetworkSelector>[1];
};

function deriveGlobalState({
  feature_name,
  network_name,
}: {
  feature_name: FeatureName;
  network_name: NetworkName;
}): GlobalState {
  return {
    feature_name,
    network_name,
    network_value: networks[network_name],
    aptos_client: new AptosClient(networks[network_name]),
  };
}

const initialGlobalState = deriveGlobalState({
  feature_name: safeGetSelectedFeatureName(),
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
