import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {CombinedGraphQLErrors, gql} from "@apollo/client";

export type FAActivity = {
  transaction_version: number;
  owner_address: string;
};

export function useGetCoinActivities(
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
    // Exclude gas fees from the list
    gql`
      query GetFungibleAssetActivities(
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
