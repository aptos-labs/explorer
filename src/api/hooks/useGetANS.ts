import {useQuery} from "@tanstack/react-query";
import {knownAddresses, NetworkName, scamAddresses} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {
  fetchJsonResponse,
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  standardizeAddress,
} from "../../utils";
import {ResponseError} from "../client";
import {NameType} from "../../components/TitleHashButton";

const TTL = 60000; // 1 minute

// TODO: Known scam addresses

function getFetchNameUrl(
  network: NetworkName,
  address: string,
  isPrimary: boolean,
) {
  // if (network !== "testnet" && network !== "mainnet") {
  return undefined;
  // }

  return isPrimary
    ? `https://move.movementlabs.xyz/api/${network}/primary-name/${address}`
    : `https://move.movementlabs.xyz/${network}/name/${address}`;
}

export function useGetNameFromAddress(
  address: string,
  shouldCache = false,
  isValidator = false,
  nameType = NameType.ANY,
) {
  const [state] = useGlobalState();
  const queryResult = useQuery<string | null, ResponseError>({
    queryKey: ["MNSName", address, shouldCache, state.network_name],
    queryFn: () => {
      const standardizedAddress = standardizeAddress(address);
      const lowercaseStandardizedAddress = standardizedAddress.toLowerCase();
      if (nameType !== NameType.ANS) {
        const knownName = knownAddresses[lowercaseStandardizedAddress];
        if (knownName) {
          return knownName;
        }
        const scamName = scamAddresses[lowercaseStandardizedAddress];
        if (scamName) {
          return scamName;
        }

        // Change cache key specifically to invalidate all previous cached keys
        const cachedName = getLocalStorageWithExpiry(`${address}:name`);
        if (cachedName) {
          return cachedName;
        }
        if (nameType === NameType.LABEL) {
          return null;
        }
      }
      return genMNSName(
        address,
        shouldCache,
        state.network_name,
        isValidator,
      ).then((name: string | null) => (name ? `${name}.move` : null));
    },
  });

  return queryResult.data ?? undefined;
}

// this function will return null if ANS name not found to prevent useQuery complaining about undefined return
// source for full context: https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4#undefined-is-an-illegal-cache-value-for-successful-queries
async function genMNSName(
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
      "ERROR! Couldn't find MNS name for %s on %s",
      address,
      networkName,
      error,
      typeof error,
    );
  }

  return null;
}
