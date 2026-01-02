import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {CombinedGraphQLErrors, gql} from "@apollo/client";

export type FAActivity = {
  transaction_version: number;
  transaction_timestamp: string;
  owner_address: string;
};

export function useGetCoinActivities(
  asset: string,
  offset?: number,
): {
  isLoading: boolean;
  error: CombinedGraphQLErrors | undefined;
  data: FAActivity[] | undefined;
} {
  const {loading, error, data} = useGraphqlQuery<{
    fungible_asset_activities: FAActivity[];
  }>(
    // Exclude gas fees from the list
    gql`
      query GetFungibleAssetActivities($asset: String, $offset: Int) {
        fungible_asset_activities(
          where: {
            asset_type: {_eq: $asset}
            type: {_neq: "0x1::aptos_coin::GasFeeEvent"}
          }
          offset: $offset
          limit: 100
          order_by: {transaction_version: desc}
          distinct_on: transaction_version
        ) {
          transaction_version
          owner_address
          transaction_timestamp
        }
      }
    `,
    {variables: {asset, offset: offset ?? 0}},
  );

  return {
    isLoading: loading,
    error: error ? (error as CombinedGraphQLErrors) : undefined,
    data: data?.fungible_asset_activities,
  };
}
