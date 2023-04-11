import {useEffect, useState} from "react";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import {
  fetchJsonResponse,
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  truncateAptSuffix,
} from "../../utils";

const TTL = 60000; // 1 minute

function getFetchNameUrl(
  network: NetworkName,
  address: string,
  isPrimary: boolean,
) {
  if (network !== "testnet" && network !== "mainnet") {
    return undefined;
  }

  return isPrimary
    ? `https://www.aptosnames.com/api/${network}/v1/primary-name/${address}`
    : `https://www.aptosnames.com/api/${network}/v1/name/${address}`;
}

export function useGetNameFromAddress(address: string, shouldCache = false) {
  const [state, _] = useGlobalState();
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    const cachedName = getLocalStorageWithExpiry(address);
    if (cachedName) {
      setName(cachedName);
      return;
    }

    const primaryNameUrl = getFetchNameUrl(state.network_name, address, true);
    if (primaryNameUrl !== undefined) {
      const fetchData = async () => {
        const {name: primaryName} = await fetchJsonResponse(primaryNameUrl);

        if (primaryName) {
          if (shouldCache) {
            setLocalStorageWithExpiry(address, primaryName, TTL);
          }
          setName(primaryName);
        } else {
          const nameUrl =
            getFetchNameUrl(state.network_name, address, false) ?? "";
          const {name} = await fetchJsonResponse(nameUrl);
          if (shouldCache) {
            setLocalStorageWithExpiry(address, name, TTL);
          }
          setName(name);
        }
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    }
  }, [address, state]);

  return name;
}

function getFetchAddressUrl(network: NetworkName, name: string) {
  if (network !== "testnet" && network !== "mainnet") {
    return undefined;
  }

  return `https://www.aptosnames.com/api/${network}/v1/address/${name}`;
}

export async function getAddressFromName(
  name: string,
  network: NetworkName,
): Promise<{address: string | undefined; primaryName: string | undefined}> {
  const searchableName = truncateAptSuffix(name);
  const addressUrl = getFetchAddressUrl(network, searchableName);

  const notFoundResult = {address: undefined, primaryName: undefined};
  if (addressUrl === undefined) {
    return notFoundResult;
  }

  try {
    const {address} = await fetchJsonResponse(addressUrl);

    const primaryNameUrl = getFetchNameUrl(network, address, true);
    const primaryNameResponse = await fetch(primaryNameUrl ?? "");
    const {name: primaryName} = await primaryNameResponse.json();

    return {address: address, primaryName: primaryName};
  } catch {
    return notFoundResult;
  }
}
