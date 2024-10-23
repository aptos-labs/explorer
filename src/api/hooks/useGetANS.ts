import {useQuery} from "@tanstack/react-query";
import {NetworkName} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {
  fetchJsonResponse,
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  standardizeAddress,
} from "../../utils";
import {ResponseError} from "../client";

const TTL = 60000; // 1 minute

// This is an override of ANS names, in case we want to display a verified name for an address
// TODO: this probably belongs somewhere else... but, for now, it's here
const knownAddresses: Record<string, string> = {
  "0xa": "AptosCoin",
  "0x000000000000000000000000000000000000000000000000000000000000000a":
    "AptosCoin",
};

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
  const [state] = useGlobalState();
  const queryResult = useQuery<string | null, ResponseError>({
    queryKey: ["ANSName", address, shouldCache, state.network_name],
    queryFn: () => {
      const standardizedAddress = standardizeAddress(address);
      const knownName = knownAddresses[standardizedAddress.toLowerCase()];
      if (knownName) {
        return knownName;
      }

      // Change cache key specifically to invalidate all previous cached keys
      const cachedName = getLocalStorageWithExpiry(`${address}:name`);
      if (cachedName) {
        return cachedName;
      }
      // Ensure there's always .apt at the end
      return genANSName(
        address,
        shouldCache,
        state.network_name,
        isValidator,
      ).then((name) => (name ? `${name}.apt` : null));
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
