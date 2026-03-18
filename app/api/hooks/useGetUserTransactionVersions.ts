import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";

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

const USER_TRANSACTIONS_FUNCTION_QUERY = `
  query UserTransactionsByFunction($limit: Int, $start_version: bigint, $offset: Int, $entry_function_id_str: String) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
      where: {
        version: {_lte: $start_version}
        entry_function_id_str: {_eq: $entry_function_id_str}
      }
      offset: $offset
    ) {
      version
    }
  }
`;

const TOP_USER_TRANSACTIONS_FUNCTION_QUERY = `
  query UserTransactionsByFunction($limit: Int, $entry_function_id_str: String) {
    user_transactions(
      limit: $limit
      order_by: {version: desc}
      where: {entry_function_id_str: {_eq: $entry_function_id_str}}
    ) {
      version
    }
  }
`;

const USER_TRANSACTIONS_FUNCTION_COUNT_QUERY = `
  query UserTransactionsByFunctionCount($entry_function_id_str: String) {
    user_transactions_aggregate(
      where: {entry_function_id_str: {_eq: $entry_function_id_str}}
    ) {
      aggregate {
        count
      }
    }
  }
`;

export default function useGetUserTransactionVersions(
  limit: number,
  startVersion?: number,
  offset?: number,
): number[] {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const topTxnsOnly = startVersion === undefined || offset === undefined;

  const {data} = useQuery({
    queryKey: [
      "userTransactionVersions",
      limit,
      startVersion,
      offset,
      networkValue,
    ],
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

export function useGetUserTransactionsByFunctionCount(
  functionFilter: string,
): number | undefined {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data} = useQuery({
    queryKey: ["userTransactionsByFunctionCount", functionFilter, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: USER_TRANSACTIONS_FUNCTION_COUNT_QUERY,
          variables: {entry_function_id_str: functionFilter},
        },
      }),
    enabled: functionFilter.length > 0,
  });

  return data?.user_transactions_aggregate?.aggregate?.count;
}

export function useGetUserTransactionVersionsByFunction(
  limit: number,
  functionFilter: string,
  startVersion?: number,
  offset?: number,
): {versions: number[]; isLoading: boolean; isError: boolean} {
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();
  const topTxnsOnly = startVersion === undefined || offset === undefined;

  const {data, isLoading, isError} = useQuery({
    queryKey: [
      "userTransactionVersionsByFunction",
      limit,
      startVersion,
      offset,
      functionFilter,
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{user_transactions: {version: number}[]}>({
        query: {
          query: topTxnsOnly
            ? TOP_USER_TRANSACTIONS_FUNCTION_QUERY
            : USER_TRANSACTIONS_FUNCTION_QUERY,
          variables: {
            limit,
            start_version: startVersion,
            offset,
            entry_function_id_str: functionFilter,
          },
        },
      }),
    enabled: functionFilter.length > 0,
  });

  if (!data) {
    return {versions: [], isLoading, isError};
  }

  return {
    versions: data.user_transactions.map(
      (txn: {version: number}) => txn.version,
    ),
    isLoading,
    isError,
  };
}
