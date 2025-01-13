import {gql, useQuery as useGraphqlQuery} from "@apollo/client";

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
  const topTxnsOnly = startVersion === undefined || offset === undefined;
  const {loading, error, data} = useGraphqlQuery(
    topTxnsOnly ? TOP_USER_TRANSACTIONS_QUERY : USER_TRANSACTIONS_QUERY,
    {variables: {limit: limit, start_version: startVersion, offset: offset}},
  );

  if (loading || error || !data) {
    return [];
  }

  return data.user_transactions.map((txn: {version: number}) => {
    return txn.version;
  });
}
