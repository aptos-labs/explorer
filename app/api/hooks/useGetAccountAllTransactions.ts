import {useQuery} from "@tanstack/react-query";
import {tryStandardizeAddress} from "../../utils";
import {useNetworkValue, useSdkV2Client} from "../../global-config";

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
