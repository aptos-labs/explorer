import {useSearchParams} from "react-router-dom";
import {
  NetworkName,
  isValidNetworkName,
  defaultNetworkName,
} from "../constants";

// This is a custom hook that allows us to select a feature
// The selected network name is stored in the url as a query param.
// don't use this hook directly in components, rather use: const [useGlobalState, {selectNetwork}] = useGlobalState();
export function useNetworkSelector() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedNetworkQueryParam = searchParams.get("network") ?? "";

  function selectNetwork(network: NetworkName) {
    if (!isValidNetworkName(network)) return;
    if (network === "mainnet") {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("network");
        return newParams;
      });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("network", network);
        return newParams;
      });
    }
  }

  if (isValidNetworkName(selectedNetworkQueryParam)) {
    return [selectedNetworkQueryParam, selectNetwork] as const;
  } else {
    return [defaultNetworkName, selectNetwork] as const;
  }
}
