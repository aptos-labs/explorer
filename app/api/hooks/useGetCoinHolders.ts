import {useQuery} from "@tanstack/react-query";
import {gql} from "graphql-request";
import {useGetGraphqlClient} from "./useGraphqlClient";

export type CoinHolder = {
  owner_address: string;
  amount: number;
};

const COIN_HOLDERS_QUERY = gql`
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
  }
`;

export function useGetCoinHolders(
  coin_type: string,
  limit: number = 25,
  offset?: number,
): {
  isLoading: boolean;
  error: Error | undefined;
  data: CoinHolder[] | undefined;
  hasMore: boolean;
} {
  const client = useGetGraphqlClient();
  const {isLoading, error, data} = useQuery({
    queryKey: ["coinHolders", coin_type, limit, offset ?? 0],
    queryFn: () =>
      client.request<{current_fungible_asset_balances: CoinHolder[]}>(
        COIN_HOLDERS_QUERY,
        {coin_type, limit, offset: offset ?? 0},
      ),
  });

  return {
    isLoading,
    error: error ? (error as Error) : undefined,
    data: data?.current_fungible_asset_balances,
    hasMore: (data?.current_fungible_asset_balances?.length ?? 0) === limit,
  };
}
