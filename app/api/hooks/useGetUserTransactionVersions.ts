import {useQuery} from "@tanstack/react-query";
import {useSdkV2Client} from "../../global-config";

const USER_TRANSACTIONS_QUERY = `
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

const TOP_USER_TRANSACTIONS_QUERY = `
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
  const client = useSdkV2Client();
  const topTxnsOnly = startVersion === undefined || offset === undefined;

  const {data} = useQuery({
    queryKey: ["userTransactionVersions", limit, startVersion, offset],
    queryFn: () =>
      client.queryIndexer<{user_transactions: {version: number}[]}>({
        query: {
          query: topTxnsOnly
            ? TOP_USER_TRANSACTIONS_QUERY
            : USER_TRANSACTIONS_QUERY,
          variables: {limit, start_version: startVersion, offset},
        },
      }),
  });

  if (!data) {
    return [];
  }

  return data.user_transactions.map((txn: {version: number}) => txn.version);
}
