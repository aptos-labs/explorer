import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {CombinedGraphQLErrors, gql} from "@apollo/client";

export type CoinHolder = {
  owner_address: string;
  amount: number;
};

export function useGetCoinHolders(
  coin_type: string,
  offset?: number,
): {
  isLoading: boolean;
  error: CombinedGraphQLErrors | undefined;
  data: CoinHolder[] | undefined;
} {
  const {loading, error, data} = useGraphqlQuery<{
    current_fungible_asset_balances: CoinHolder[];
  }>(
    gql`
      query GetFungibleAssetBalances($coin_type: String!, $offset: Int!) {
        current_fungible_asset_balances(
          where: {asset_type: {_eq: $coin_type}}
          limit: 100
          offset: $offset
          order_by: {amount: desc}
        ) {
          owner_address
          amount
        }
      }
    `,
    {variables: {coin_type, offset: offset ?? 0}},
  );

  return {
    isLoading: loading,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: error as any,
    data: data?.current_fungible_asset_balances,
  };
}
