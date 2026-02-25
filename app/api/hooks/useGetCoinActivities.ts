import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";

export type FAActivity = {
  transaction_version: number;
  owner_address: string;
};

const COIN_ACTIVITIES_QUERY = `
  query GetFungibleAssetActivities($asset: String, $limit: Int, $offset: Int) {
    fungible_asset_activities(
      where: {
        asset_type: {_eq: $asset}
        type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
      }
      offset: $offset
      limit: $limit
      order_by: {transaction_version: desc}
      distinct_on: transaction_version
    ) {
      transaction_version
      owner_address
    }
    fungible_asset_activities_aggregate(
      where: {
        asset_type: {_eq: $asset}
        type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export function useGetCoinActivities(
  asset: string,
  limit: number = 25,
  offset?: number,
): {
  isLoading: boolean;
  error: Error | undefined;
  data: FAActivity[] | undefined;
  count: number | undefined;
} {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const {isLoading, error, data} = useQuery({
    queryKey: ["coinActivities", asset, limit, offset ?? 0, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        fungible_asset_activities: FAActivity[];
        fungible_asset_activities_aggregate: {
          aggregate: {count: number};
        };
      }>({
        query: {
          query: COIN_ACTIVITIES_QUERY,
          variables: {asset, limit, offset: offset ?? 0},
        },
      }),
  });

  return {
    isLoading,
    error: error ? (error as Error) : undefined,
    data: data?.fungible_asset_activities,
    count: data?.fungible_asset_activities_aggregate?.aggregate?.count,
  };
}
