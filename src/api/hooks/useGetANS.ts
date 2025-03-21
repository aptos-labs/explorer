import {useQuery} from "@tanstack/react-query";
import {knownAddresses, NetworkName, scamAddresses} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {
  fetchJsonResponse,
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  tryStandardizeAddress,
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
  nameType = NameType.ANY,
) {
  const [state] = useGlobalState();
  const queryResult = useQuery<string | null, ResponseError>({
    queryKey: ["ANSName", address, shouldCache, state.network_name, nameType],
    queryFn: () => {
      const standardizedAddress = tryStandardizeAddress(address);
      if (!standardizedAddress) {
        return null;
      }
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

// this function will return null if ANS name not found to prevent useQuery complaining about undefined return
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
      "ERROR! Couldn't find ANS name for %s on %s",
      address,
      networkName,
      error,
      typeof error,
    );
  }

  return null;
}
