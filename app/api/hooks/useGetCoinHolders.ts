import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {CombinedGraphQLErrors, gql} from "@apollo/client";

export type CoinHolder = {
  owner_address: string;
  amount: number;
};

export function useGetCoinHolders(
  coin_type: string,
  limit: number = 25,
  offset?: number,
): {
  isLoading: boolean;
  error: CombinedGraphQLErrors | undefined;
  data: CoinHolder[] | undefined;
  count: number | undefined;
} {
  const {loading, error, data} = useGraphqlQuery<{
    current_fungible_asset_balances: CoinHolder[];
    current_fungible_asset_balances_aggregate: {
      aggregate: {
        count: number;
      };
    };
  }>(
    gql`
      query GetFungibleAssetBalances(
        $coin_type: String!
        $limit: Int!
        $offset: Int!
      ) {
        current_fungible_asset_balances(
          where: {asset_type: {_eq: $coin_type}}
          limit: $limit
          offset: $offset
          order_by: {amount: desc}
        ) {
          owner_address
          amount
        }
        current_fungible_asset_balances_aggregate(
          where: {asset_type: {_eq: $coin_type}}
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {variables: {coin_type, limit, offset: offset ?? 0}},
  );

  return {
    isLoading: loading,
    error: error ? (error as CombinedGraphQLErrors) : undefined,
    data: data?.current_fungible_asset_balances,
    count: data?.current_fungible_asset_balances_aggregate?.aggregate?.count,
  };
}
