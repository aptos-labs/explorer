import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";

export type FAActivity = {
  transaction_version: number;
  owner_address: string;
  type: string;
  amount: number | null;
};

export type ActivityTypeFilter = "all" | "mint" | "burn" | "transfer";

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
      type
      amount
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

const COIN_ACTIVITIES_CURSOR_QUERY = `
  query GetFungibleAssetActivitiesCursor($asset: String, $limit: Int, $cursor: bigint) {
    fungible_asset_activities(
      where: {
        asset_type: {_eq: $asset}
        type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
        transaction_version: {_lt: $cursor}
      }
      limit: $limit
      order_by: {transaction_version: desc}
      distinct_on: transaction_version
    ) {
      transaction_version
      owner_address
      type
      amount
    }
  }
`;

const COIN_ACTIVITIES_FIRST_PAGE_QUERY = `
  query GetFungibleAssetActivitiesFirstPage($asset: String, $limit: Int) {
    fungible_asset_activities(
      where: {
        asset_type: {_eq: $asset}
        type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
      }
      limit: $limit
      order_by: {transaction_version: desc}
      distinct_on: transaction_version
    ) {
      transaction_version
      owner_address
      type
      amount
    }
  }
`;

/**
 * @deprecated Use useGetCoinActivitiesCursor for better performance
 */
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

/**
 * Cursor-based pagination for coin/FA activities.
 * Uses transaction_version as cursor instead of offset, avoiding expensive count queries.
 */
export function useGetCoinActivitiesCursor(
  asset: string,
  limit: number = 25,
  cursor?: number,
): {
  isLoading: boolean;
  error: Error | undefined;
  data: FAActivity[] | undefined;
  hasNextPage: boolean;
} {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const isFirstPage = cursor === undefined;

  const {isLoading, error, data} = useQuery({
    queryKey: [
      "coinActivitiesCursor",
      asset,
      limit,
      cursor ?? "first",
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{
        fungible_asset_activities: FAActivity[];
      }>({
        query: {
          query: isFirstPage
            ? COIN_ACTIVITIES_FIRST_PAGE_QUERY
            : COIN_ACTIVITIES_CURSOR_QUERY,
          variables: isFirstPage
            ? {asset, limit: limit + 1}
            : {asset, limit: limit + 1, cursor},
        },
      }),
    staleTime: 10_000,
  });

  const activities = data?.fungible_asset_activities;
  const hasNextPage = (activities?.length ?? 0) > limit;
  const pageData = activities?.slice(0, limit);

  return {
    isLoading,
    error: error ? (error as Error) : undefined,
    data: pageData,
    hasNextPage,
  };
}

const COIN_FIRST_ACTIVITY_QUERY = `
  query GetFirstFungibleAssetActivity($asset: String) {
    fungible_asset_activities(
      where: {
        asset_type: {_eq: $asset}
        type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
      }
      limit: 1
      order_by: {transaction_version: asc}
    ) {
      transaction_version
      type
    }
  }
`;

export function useGetFirstCoinActivity(asset: string): {
  isLoading: boolean;
  data: {transaction_version: number; type: string} | undefined;
} {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {isLoading, data} = useQuery({
    queryKey: ["coinFirstActivity", asset, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        fungible_asset_activities: {
          transaction_version: number;
          type: string;
        }[];
      }>({
        query: {
          query: COIN_FIRST_ACTIVITY_QUERY,
          variables: {asset},
        },
      }),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!asset,
  });

  return {
    isLoading,
    data: data?.fungible_asset_activities?.[0],
  };
}
