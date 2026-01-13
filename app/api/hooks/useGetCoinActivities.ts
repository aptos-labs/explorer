import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {CombinedGraphQLErrors, gql} from "@apollo/client";

export type FAActivity = {
  transaction_version: number;
  owner_address: string;
};

/**
 * Optimized hook for fetching coin/fungible asset activities.
 *
 * Performance optimizations:
 * 1. Uses cursor-based pagination (transaction_version < cursor) instead of offset
 *    - Offset pagination requires scanning all previous rows
 *    - Cursor pagination uses indexed lookups, much faster
 * 2. Removed distinct_on which was causing slow sequential scans
 *    - We fetch slightly more and deduplicate on client side
 * 3. Removed aggregate count query - uses "Load More" pattern instead
 *    - Count queries over large tables are expensive
 */
export function useGetCoinActivities(
  asset: string,
  limit: number = 25,
  cursor?: number, // Changed from offset to cursor (transaction_version to paginate from)
): {
  isLoading: boolean;
  error: CombinedGraphQLErrors | undefined;
  data: FAActivity[] | undefined;
  hasMore: boolean;
} {
  // Fetch extra to detect if there are more results
  const fetchLimit = limit + 1;

  const {loading, error, data} = useGraphqlQuery<{
    fungible_asset_activities: FAActivity[];
  }>(
    // Exclude gas fees from the list
    // Use cursor-based pagination for performance
    gql`
      query GetFungibleAssetActivities(
        $asset: String
        $limit: Int
        $cursor: bigint
      ) {
        fungible_asset_activities(
          where: {
            asset_type: {_eq: $asset}
            type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
            transaction_version: {_lt: $cursor}
          }
          limit: $limit
          order_by: {transaction_version: desc}
        ) {
          transaction_version
          owner_address
        }
      }
    `,
    {
      variables: {
        asset,
        limit: fetchLimit,
        // Use a very large number as initial cursor to get the most recent activities
        cursor: cursor ?? 9999999999999,
      },
    },
  );

  // Deduplicate by transaction_version on client side
  // This is efficient for small page sizes (25 items)
  const deduplicatedData = data?.fungible_asset_activities
    ? deduplicateByVersion(data.fungible_asset_activities)
    : undefined;

  // Check if we have more results
  const hasMore = (deduplicatedData?.length ?? 0) > limit;

  // Return only the requested limit
  const limitedData = deduplicatedData?.slice(0, limit);

  return {
    isLoading: loading,
    error: error ? (error as CombinedGraphQLErrors) : undefined,
    data: limitedData,
    hasMore,
  };
}

/**
 * Deduplicate activities by transaction_version, keeping first occurrence
 * This replaces the slow distinct_on database operation
 */
function deduplicateByVersion(activities: FAActivity[]): FAActivity[] {
  const seen = new Set<number>();
  return activities.filter((activity) => {
    if (seen.has(activity.transaction_version)) {
      return false;
    }
    seen.add(activity.transaction_version);
    return true;
  });
}

/**
 * Legacy hook for backwards compatibility with offset pagination
 * @deprecated Use useGetCoinActivities with cursor-based pagination instead
 */
export function useGetCoinActivitiesLegacy(
  asset: string,
  limit: number = 25,
  offset?: number,
): {
  isLoading: boolean;
  error: CombinedGraphQLErrors | undefined;
  data: FAActivity[] | undefined;
  count: number | undefined;
} {
  const {loading, error, data} = useGraphqlQuery<{
    fungible_asset_activities: FAActivity[];
    fungible_asset_activities_aggregate: {
      aggregate: {
        count: number;
      };
    };
  }>(
    gql`
      query GetFungibleAssetActivitiesLegacy(
        $asset: String
        $limit: Int
        $offset: Int
      ) {
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
    `,
    {variables: {asset, limit, offset: offset ?? 0}},
  );

  return {
    isLoading: loading,
    error: error ? (error as CombinedGraphQLErrors) : undefined,
    data: data?.fungible_asset_activities,
    count: data?.fungible_asset_activities_aggregate?.aggregate?.count,
  };
}
