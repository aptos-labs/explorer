import {useQuery} from "@tanstack/react-query";
import {knownAddresses, NetworkName, scamAddresses} from "../../constants";
import {getCachedV2Client, useNetworkName} from "../../global-config";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
  tryStandardizeAddress,
} from "../../utils";
import {ResponseError} from "../client";
import {NameType} from "../../components/TitleHashButton";

// ANS names rarely change - cache for 30 minutes
const TTL = 30 * 60 * 1000; // 30 minutes

function isAnsSupportedNetwork(network: NetworkName): boolean {
  return network === "testnet" || network === "mainnet";
}

// this function will return null if ANS name not found to prevent useQuery complaining about undefined return
// source for full context: https://tanstack.com/query/v4/docs/react/guides/migrating-to-react-query-4#undefined-is-an-illegal-cache-value-for-successful-queries
async function genANSName(
  address: string,
  shouldCache: boolean,
  networkName: NetworkName,
  isValidator: boolean,
): Promise<string | null> {
  if (!isAnsSupportedNetwork(networkName)) {
    return null;
  }

  const standardizedAddress = tryStandardizeAddress(address);
  if (!standardizedAddress) {
    return null;
  }

  const client = getCachedV2Client(networkName);

  try {
    const primaryName = await client.getPrimaryName({
      address: standardizedAddress,
    });

    if (primaryName) {
      if (shouldCache) {
        setLocalStorageWithExpiry(address, primaryName, TTL);
      }
      return primaryName;
    }

    if (isValidator) {
      return null;
    }

    const {names: ansNames} = await client.getAccountNames({
      accountAddress: standardizedAddress,
    });
    const first = ansNames[0];
    const fallbackName = first
      ? first.subdomain
        ? `${first.subdomain}.${first.domain}`
        : first.domain
      : null;

    if (fallbackName) {
      if (shouldCache) {
        setLocalStorageWithExpiry(address, fallbackName, TTL);
      }
      return fallbackName;
    }

    return null;
  } catch (error) {
    console.error(
      "ERROR! Couldn't find ANS name for %s on %s",
      address,
      networkName,
      error,
      typeof error,
    );
    return null;
  }
}

export function useGetNameFromAddress(
  address: string,
  shouldCache = false,
  isValidator = false,
  nameType = NameType.ANY,
) {
  const networkName = useNetworkName();
  const queryResult = useQuery<string | null, ResponseError>({
    queryKey: ["ANSName", address, shouldCache, networkName, nameType],
    // ANS names rarely change - cache for 30 minutes
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
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
      return genANSName(address, shouldCache, networkName, isValidator).then(
        (name) => (name ? `${name}.apt` : null),
      );
    },
  });

  return queryResult.data ?? undefined;
}

export function useGetAddressFromName(name: string) {
  const networkName = useNetworkName();
  // Normalize name for consistent caching (ANS names are case-insensitive)
  const normalizedName = name.toLowerCase();

  return useQuery<string | null, ResponseError>({
    queryKey: ["ANSAddress", normalizedName, networkName],
    // ANS addresses rarely change - cache for 30 minutes
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    queryFn: async (): Promise<string | null> => {
      if (!normalizedName || !normalizedName.endsWith(".apt")) {
        return null;
      }

      if (!isAnsSupportedNetwork(networkName)) {
        return null;
      }

      try {
        const cleanName = normalizedName.endsWith(".apt")
          ? normalizedName.slice(0, -4)
          : normalizedName;
        const client = getCachedV2Client(networkName);
        const ansName = await client.getName({
          name: `${cleanName}.apt`,
        });
        const address = ansName?.registered_address ?? ansName?.owner_address;
        return address ? (tryStandardizeAddress(address) ?? null) : null;
      } catch (error) {
        console.error(
          "ERROR! Couldn't resolve ANS name %s on %s",
          name,
          networkName,
          error,
        );
        return null;
      }
    },
  });
}
