import {gql} from "@apollo/client";
import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {tryStandardizeAddress} from "../../utils";

const ACCOUNT_TRANSACTIONS_COUNT_QUERY = gql`
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
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const addr64Hash = tryStandardizeAddress(address);

  const {loading, error, data} = useGraphqlQuery<{
    account_transactions_aggregate: {aggregate: {count: number}};
  }>(ACCOUNT_TRANSACTIONS_COUNT_QUERY, {variables: {address: addr64Hash}});

  if (!addr64Hash || loading || error || !data) {
    return undefined;
  }

  return data.account_transactions_aggregate?.aggregate?.count;
}

const ACCOUNT_TRANSACTIONS_QUERY = gql`
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

  const {loading, error, data} = useGraphqlQuery<{
    account_transactions: {transaction_version: number}[];
  }>(ACCOUNT_TRANSACTIONS_QUERY, {
    variables: {address: addr64Hash, limit: limit, offset: offset},
  });

  if (!addr64Hash || loading || error || !data) {
    return [];
  }

  return data.account_transactions.map(
    (resource: {transaction_version: number}) => {
      return resource.transaction_version;
    },
  );
}

// Hook to fetch ALL transaction versions for an account (for CSV export)
export function useGetAllAccountTransactionVersions(address: string): {
  versions: number[];
  loading: boolean;
  error: unknown;
} {
  const addr64Hash = tryStandardizeAddress(address);

  const {loading, error, data} = useGraphqlQuery<{
    account_transactions: {transaction_version: number}[];
  }>(ACCOUNT_TRANSACTIONS_QUERY, {
    variables: {
      address: addr64Hash,
      // Set limit to 10000 to support CSV export of up to 10000 transactions
      // The GraphQL API might have its own limits, but this should work for most accounts
      limit: 10000,
      offset: 0,
    },
  });

  if (!addr64Hash || error) {
    return {versions: [], loading, error};
  }

  if (loading || !data) {
    return {versions: [], loading: true, error: null};
  }

  const versions = data.account_transactions.map(
    (resource: {transaction_version: number}) => {
      return resource.transaction_version;
    },
  );

  return {versions, loading: false, error: null};
}
