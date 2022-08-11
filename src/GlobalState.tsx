import React from "react";
import {networks, defaultNetworkName, ExplorerNetworks} from "./constants";

const selected_network = safeGetSelectedNetworkName() as ExplorerNetworks;

function safeGetSelectedNetworkName(): string {
  let selected_network = localStorage.getItem("selected_network");
  if (selected_network) {
    selected_network = selected_network.toLowerCase();
    if (selected_network in networks) {
      return selected_network;
    }
  }
  return defaultNetworkName.toLowerCase();
}

export type GlobalState = {
  network_name: ExplorerNetworks;
  network_value: string;
};

const defaultGlobalState: GlobalState = {
  network_name: selected_network,
  network_value: networks[selected_network],
};

function reducer(state: GlobalState, newValue: GlobalState): GlobalState {
  if (newValue.network_name)
    localStorage.setItem(
      "selected_network",
      newValue.network_name.toLowerCase(),
    );
  return {...state, ...newValue};
}

export const GlobalStateContext = React.createContext(defaultGlobalState);
export const DispatchStateContext = React.createContext<
  React.Dispatch<GlobalState>
>((value: GlobalState) => value);

export const GlobalStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = React.useReducer(reducer, defaultGlobalState);
  return (
    <GlobalStateContext.Provider value={state}>
      <DispatchStateContext.Provider value={dispatch}>
        {children}
      </DispatchStateContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): [
  GlobalState,
  React.Dispatch<GlobalState>,
] => [
  React.useContext(GlobalStateContext),
  React.useContext(DispatchStateContext),
];
