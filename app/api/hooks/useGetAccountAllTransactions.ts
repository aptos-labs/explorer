import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";

const ACCOUNT_TRANSACTIONS_COUNT_QUERY = `
  query AccountTransactionsCount($address: String) {
    account_transactions_aggregate(where: {account_address: {_eq: $address}}) {
      aggregate {
        count
      }
    }
  }
`;

export function useGetAccountAllTransactionCount(
  address: string,
): number | undefined {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data} = useQuery({
    queryKey: ["accountTxnCount", addr64Hash, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        account_transactions_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: ACCOUNT_TRANSACTIONS_COUNT_QUERY,
          variables: {address: addr64Hash},
        },
      }),
    enabled: !!addr64Hash,
  });

  return data?.account_transactions_aggregate?.aggregate?.count;
}

const ACCOUNT_TRANSACTIONS_QUERY = `
  query AccountTransactionsData($address: String, $limit: Int, $offset: Int) {
    account_transactions(
      where: {account_address: {_eq: $address}}
      order_by: {transaction_version: desc}
      limit: $limit
      offset: $offset
    ) {
      transaction_version
    }
  }
`;

export function useGetAccountAllTransactionVersions(
  address: string,
  limit: number,
  offset?: number,
): number[] {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data} = useQuery({
    queryKey: ["accountTxnVersions", addr64Hash, limit, offset, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        account_transactions: {transaction_version: number}[];
      }>({
        query: {
          query: ACCOUNT_TRANSACTIONS_QUERY,
          variables: {address: addr64Hash, limit, offset},
        },
      }),
    enabled: !!addr64Hash,
  });

  if (!data) return [];
  return data.account_transactions.map(
    (resource: {transaction_version: number}) => resource.transaction_version,
  );
}

export function useGetAllAccountTransactionVersions(address: string): {
  versions: number[];
  loading: boolean;
  error: unknown;
} {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: ["allAccountTxnVersions", addr64Hash, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        account_transactions: {transaction_version: number}[];
      }>({
        query: {
          query: ACCOUNT_TRANSACTIONS_QUERY,
          variables: {address: addr64Hash, limit: 10000, offset: 0},
        },
      }),
    enabled: !!addr64Hash,
  });

  if (!addr64Hash || error) {
    return {versions: [], loading: isLoading, error};
  }

  if (isLoading || !data) {
    return {versions: [], loading: true, error: null};
  }

  return {
    versions: data.account_transactions.map(
      (r: {transaction_version: number}) => r.transaction_version,
    ),
    loading: false,
    error: null,
  };
}

const ACCOUNT_USER_TRANSACTIONS_BY_FUNCTION_QUERY = `
  query AccountUserTransactionsByFunction($sender: String, $entry_function_id_str: String, $limit: Int, $offset: Int) {
    user_transactions(
      where: {
        sender: {_eq: $sender}
        entry_function_id_str: {_eq: $entry_function_id_str}
      }
      order_by: {version: desc}
      limit: $limit
      offset: $offset
    ) {
      version
    }
  }
`;

const ACCOUNT_USER_TRANSACTIONS_BY_FUNCTION_COUNT_QUERY = `
  query AccountUserTransactionsByFunctionCount($sender: String, $entry_function_id_str: String) {
    user_transactions_aggregate(
      where: {
        sender: {_eq: $sender}
        entry_function_id_str: {_eq: $entry_function_id_str}
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export function useGetAccountTransactionsByFunctionCount(
  address: string,
  functionFilter: string,
): number | undefined {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data} = useQuery({
    queryKey: ["accountTxnByFnCount", addr64Hash, functionFilter, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: ACCOUNT_USER_TRANSACTIONS_BY_FUNCTION_COUNT_QUERY,
          variables: {
            sender: addr64Hash,
            entry_function_id_str: functionFilter,
          },
        },
      }),
    enabled: !!addr64Hash && functionFilter.length > 0,
  });

  return data?.user_transactions_aggregate?.aggregate?.count;
}

export function useGetAccountTransactionVersionsByFunction(
  address: string,
  functionFilter: string,
  limit: number,
  offset?: number,
): {versions: number[]; isLoading: boolean; isError: boolean} {
  const addr64Hash = tryStandardizeAddress(address);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data, isLoading, isError} = useQuery({
    queryKey: [
      "accountTxnVersionsByFn",
      addr64Hash,
      functionFilter,
      limit,
      offset,
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{
        user_transactions: {version: number}[];
      }>({
        query: {
          query: ACCOUNT_USER_TRANSACTIONS_BY_FUNCTION_QUERY,
          variables: {
            sender: addr64Hash,
            entry_function_id_str: functionFilter,
            limit,
            offset,
          },
        },
      }),
    enabled: !!addr64Hash && functionFilter.length > 0,
  });

  if (!data) return {versions: [], isLoading, isError};
  return {
    versions: data.user_transactions.map(
      (txn: {version: number}) => txn.version,
    ),
    isLoading,
    isError,
  };
}
