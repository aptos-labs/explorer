import {useQuery} from "@tanstack/react-query";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {
  fetchJsonResponse,
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  truncateAptSuffix,
} from "../../utils";
import {ResponseError} from "../client";

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

export function useGetNameFromAddress(
  address: string,
  shouldCache = false,
  isValidator = false,
) {
  const [state, _] = useGlobalState();
  const queryResult = useQuery<string | null, ResponseError>({
    queryKey: ["ANSName", address, shouldCache, state.network_name],
    queryFn: () => {
      const cachedName = getLocalStorageWithExpiry(address);
      if (cachedName) {
        return cachedName;
      }
      return genANSName(address, shouldCache, state.network_name, isValidator);
    },
  });

  return queryResult.data ?? undefined;
}

// this function will return null if ans name not found to prevent useQuery complaining about undefined return
// source for full context: https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4#undefined-is-an-illegal-cache-value-for-successful-queries
async function genANSName(
  address: string,
  shouldCache: boolean,
  networkName: NetworkName,
  isValidator: boolean,
): Promise<string | null> {
  const primaryNameUrl = getFetchNameUrl(networkName, address, true);

  if (!primaryNameUrl) {
    return null;
  }

  try {
    const {name: primaryName} = await fetchJsonResponse(primaryNameUrl);

    if (primaryName) {
      if (shouldCache) {
        setLocalStorageWithExpiry(address, primaryName, TTL);
      }
      return primaryName;
    } else if (isValidator) {
      return null;
    } else {
      const nameUrl = getFetchNameUrl(networkName, address, false);

      if (!nameUrl) {
        return null;
      }

      const {name} = await fetchJsonResponse(nameUrl);
      if (shouldCache) {
        setLocalStorageWithExpiry(address, name, TTL);
      }
      return name ?? null;
    }
  } catch (error) {
    console.error(
      `ERROR! Couldn't find ANS name for ${address} on ${networkName}`,
      error,
      typeof error,
    );
  }

  return null;
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
