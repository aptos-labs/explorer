import {useSearchParams} from "react-router-dom";
import {
  NetworkName,
  isValidNetworkName,
  defaultNetworkName,
} from "../constants";
import {useEffect} from "react";

const SELECTED_NETWORK_LOCAL_STORAGE_KEY = "selected_network";

function getUserSelectedNetworkFromLocalStorageWithDefault(): NetworkName {
  const network = localStorage.getItem(SELECTED_NETWORK_LOCAL_STORAGE_KEY);
  if (!isValidNetworkName(network ?? "")) {
    return defaultNetworkName;
  }
  return network as NetworkName;
}

// function writeSelectedNetworkToLocalStorage(network: NetworkName) {
//   const currentLocalStorageNetwork = localStorage.getItem(
//     SELECTED_NETWORK_LOCAL_STORAGE_KEY,
//   );
//   if (network === defaultNetworkName && currentLocalStorageNetwork != null) {
//     // if network selection is default network (i.e. mainnet) we remove the local storage entry
//     localStorage.removeItem(SELECTED_NETWORK_LOCAL_STORAGE_KEY);
//   } else if (currentLocalStorageNetwork !== network) {
//     localStorage.setItem(SELECTED_NETWORK_LOCAL_STORAGE_KEY, network);
//   }
// }

// This is a custom hook that allows us to read and write the selectedNetwork.
// Note that this hook implements essentially 3 things:
// 1. The hook will return the currently selected network, which is essentially whatever is contained in the URL query param "network".
// 2. If the URL query param "network" is not present, the hook will perform this on initialization:
//    1. check localStorage for a previously selected network. If no previously selected network is found, it will default to the defaultNetworkName.
//    2. set the URL query param "network" to the result of 1.
// 3. Lastly, the hook provides a function to explicitly select/switch a network. This function will update the URL query param "network" and also store the selected network in local storage.
//    This is aimed to be used by the network selection dropdown in the header.
// WARNING: don't use this hook directly in components, rather use: const [useGlobalState, {selectNetwork}] = useGlobalState();
export function useNetworkSelector() {
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(setSearchParams);

  const selectedNetworkQueryParam = searchParams.get("network") ?? "";

  function selectNetwork(
    network: NetworkName,
    {replace = false}: {replace?: boolean} = {},
  ) {
    console.log(replace);
    // if (!isValidNetworkName(network)) return;
    // setSearchParams(
    //   (prev) => {
    //     const newParams = new URLSearchParams(prev);
    //     newParams.set("network", network);
    //     return newParams;
    //   },
    //   {replace},
    // );
    // writeSelectedNetworkToLocalStorage(network);
  }

  // on init check for existence of network query param, if not present, check local storage for a previously selected network. Then set query param to the network defined in local storage.
  useEffect(
    () => {
      const currentNetworkSearchParam = searchParams.get("network");
      if (!isValidNetworkName(currentNetworkSearchParam ?? "")) {
        selectNetwork(getUserSelectedNetworkFromLocalStorageWithDefault(), {
          replace: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // empty [] makes this effect only run once (on mount)
  );

  if (isValidNetworkName(selectedNetworkQueryParam)) {
    return [selectedNetworkQueryParam, selectNetwork] as const;
  } else {
    return [defaultNetworkName, selectNetwork] as const;
  }
}
