import {useQuery} from "@tanstack/react-query";
import {gql} from "graphql-request";
import {useGetGraphqlClient} from "./useGraphqlClient";

const USER_TRANSACTIONS_QUERY = gql`
  query UserTransactions($limit: Int, $start_version: bigint, $offset: Int) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
      where: {version: {_lte: $start_version}}
      offset: $offset
    ) {
      version
    }
  }
`;

const TOP_USER_TRANSACTIONS_QUERY = gql`
  query UserTransactions($limit: Int) {
    user_transactions(limit: $limit, order_by: {version: desc}) {
      version
    }
  }
`;

export default function useGetUserTransactionVersions(
  limit: number,
  startVersion?: number,
  offset?: number,
): number[] {
  const client = useGetGraphqlClient();
  const topTxnsOnly = startVersion === undefined || offset === undefined;

  const {data} = useQuery({
    queryKey: ["userTransactionVersions", limit, startVersion, offset],
    queryFn: () =>
      client.request<{user_transactions: {version: number}[]}>(
        topTxnsOnly ? TOP_USER_TRANSACTIONS_QUERY : USER_TRANSACTIONS_QUERY,
        {limit, start_version: startVersion, offset},
      ),
  });

  if (!data) {
    return [];
  }

  return data.user_transactions.map((txn: {version: number}) => txn.version);
}
