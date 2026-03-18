import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";
import type {ResponseError} from "../client";

const COINS_QUERY = `
    query CoinsData($owner_address: String, $limit: Int, $offset: Int) {
        current_fungible_asset_balances(
            where: {owner_address: {_eq: $owner_address}}
            limit: $limit
            offset: $offset
        ) {
            amount
            asset_type
            metadata {
                name
                decimals
                symbol
                token_standard
            }
        }
    }
`;

const COIN_COUNT_QUERY = `
    query GetFungibleAssetCount($address: String) {
        current_fungible_asset_balances_aggregate(
            where: {owner_address: {_eq: $address}}
            order_by: {amount: desc}
        ) {
            aggregate {
                count
            }
        }
    }
`;

export function useGetAccountCoinCount(address: string) {
  const sdkV2Client = useSdkV2Client();
  const standardizedAddress = tryStandardizeAddress(address);
  const networkValue = useNetworkValue();

  return useQuery<number, ResponseError>({
    queryKey: ["coinCount", standardizedAddress ?? address, networkValue],
    queryFn: async (): Promise<number> => {
      if (!standardizedAddress) {
        return 0;
      }

      const response = await sdkV2Client.queryIndexer<{
        current_fungible_asset_balances_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: COIN_COUNT_QUERY,
          variables: {
            address: standardizedAddress,
          },
        },
      });

      return response.current_fungible_asset_balances_aggregate.aggregate.count;
    },
    enabled: !!standardizedAddress,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

type FaBalance = {
  amount: number;
  asset_type: string;
  metadata: {
    name: string;
    decimals: number;
    symbol: string;
    token_standard: string;
  };
};

export function useGetAccountCoins(
  address: string,
  limit: number = 100,
  offset: number = 0,
) {
  const sdkV2Client = useSdkV2Client();
  const standardizedAddress = tryStandardizeAddress(address);
  const networkValue = useNetworkValue();

  return useQuery<FaBalance[], ResponseError>({
    queryKey: [
      "coinQuery",
      standardizedAddress ?? address,
      limit,
      offset,
      networkValue,
    ],
    queryFn: async (): Promise<FaBalance[]> => {
      if (!standardizedAddress) {
        return [];
      }

      const response = await sdkV2Client.queryIndexer<{
        current_fungible_asset_balances: FaBalance[];
      }>({
        query: {
          query: COINS_QUERY,
          variables: {
            owner_address: standardizedAddress,
            limit,
            offset,
          },
        },
      });

      return response.current_fungible_asset_balances;
    },
    enabled: !!standardizedAddress,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Legacy function that fetches all coins at once for backward compatibility
export function useGetAllAccountCoins(address: string) {
  const sdkV2Client = useSdkV2Client();
  const standardizedAddress = tryStandardizeAddress(address);
  const networkValue = useNetworkValue();

  // Get count first
  const count = useGetAccountCoinCount(address);

  // Now retrieve all the coins
  const PAGE_SIZE = 100;

  return useQuery<FaBalance[], ResponseError>({
    queryKey: [
      "allCoinsQuery",
      standardizedAddress ?? address,
      count.data,
      networkValue,
    ],
    queryFn: async (): Promise<FaBalance[]> => {
      if (!standardizedAddress || !count.data) {
        return [];
      }

      const promises = [];
      for (let i = 0; i < count.data; i += PAGE_SIZE) {
        promises.push(
          sdkV2Client.queryIndexer<{
            current_fungible_asset_balances: FaBalance[];
          }>({
            query: {
              query: COINS_QUERY,
              variables: {
                owner_address: standardizedAddress,
                limit: PAGE_SIZE,
                offset: i,
              },
            },
          }),
        );
      }

      const responses = await Promise.all(promises);
      return responses.flatMap((r) => r.current_fungible_asset_balances);
    },
    enabled: !!standardizedAddress && count.data !== undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
