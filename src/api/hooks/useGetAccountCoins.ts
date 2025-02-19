import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {standardizeAddress} from "../../utils";

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
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  return useQuery<number, ResponseError>({
    queryKey: ["coinCount", address],
    // TODO type this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      const response = await state.sdk_v2_client?.queryIndexer<{
        current_fungible_asset_balances_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: COIN_COUNT_QUERY,
          variables: {
            address: standardizedAddress,
          },
        },
      });

      return response?.current_fungible_asset_balances_aggregate.aggregate.count;
    },
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

export function useGetAccountCoins(address: string) {
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  // Get count first
  const count = useGetAccountCoinCount(address);

  // Now retrieve all the coins
  const PAGE_SIZE = 100;

  return useQuery<FaBalance[], ResponseError>({
    queryKey: ["coinQuery", address, count.data],
    // TODO: Type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      if (!count.data) {
        return [];
      }

      // TODO: make the UI paginate this, rather than query all at once
      const promises = [];
      for (let i = 0; i < count.data; i += PAGE_SIZE) {
        promises.push(
          state.sdk_v2_client.queryIndexer<{
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
  });
}
