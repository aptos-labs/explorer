import {useSearchParams} from "react-router-dom";
import {
  NetworkName,
  isValidNetworkName,
  defaultNetworkName,
} from "../constants";

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
