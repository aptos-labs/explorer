import {gql, useQuery as useGraphqlQuery} from "@apollo/client";

const USER_TRANSACTIONS_FROM_QUERY = gql`
  query UserTransactions($limit: Int, $start_version: bigint) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
      where: {version: {_lte: $start_version}}
    ) {
      version
    }
  }
`;

const USER_TRANSACTIONS_QUERY = gql`
  query UserTransactions($limit: Int) {
    user_transactions(limit: $limit, order_by: {version: desc}) {
      version
    }
  }
`;

export default function useGetUserTransactionVersions(
  limit: number,
  startVersion?: number,
): number[] {
  const {loading, error, data} = useGraphqlQuery(
    startVersion ? USER_TRANSACTIONS_FROM_QUERY : USER_TRANSACTIONS_QUERY,
    {variables: {limit: limit, start_version: startVersion}},
  );

  if (loading || error || !data) {
    return [];
  }

  const versions: number[] = (data?.user_transactions ?? []).map(
    (txn: {version: number}) => {
      return txn.version;
    },
  );

  return versions;
}
