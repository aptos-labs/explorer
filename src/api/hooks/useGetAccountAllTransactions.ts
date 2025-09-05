import {gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {useGetIsGraphqlClientSupported} from "./useGraphqlClient";
import {tryStandardizeAddress} from "../../utils";

const ACCOUNT_TRANSACTIONS_COUNT_QUERY = gql`
  query AccountTransactionsCount($address: String) {
    move_resources_aggregate(
      where: {address: {_eq: $address}}
      distinct_on: transaction_version
    ) {
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
  const [state] = useGlobalState();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  const {loading, error, data} = useGraphqlQuery(
    ACCOUNT_TRANSACTIONS_COUNT_QUERY,
    {variables: {address: addr64Hash}, skip: !isGraphqlClientSupported},
  );

  const restQuery = useQuery({
    queryKey: [
      "account_all_transactions_count",
      {addr64Hash},
      state.network_value,
    ],
    queryFn: async () => {
      if (!addr64Hash) {
        return undefined;
      }
      const txns = await state.aptos_client.getAccountTransactions(addr64Hash, {
        limit: 100,
      });
      return txns.length;
    },
    enabled: !isGraphqlClientSupported,
  });

  if (isGraphqlClientSupported) {
    if (!addr64Hash || loading || error || !data) {
      return undefined;
    }
    return data.move_resources_aggregate?.aggregate?.count;
  }

  if (restQuery.isLoading || restQuery.isError) {
    return undefined;
  }
  return restQuery.data;
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
  const [state] = useGlobalState();
  const isGraphqlClientSupported = useGetIsGraphqlClientSupported();

  const {loading, error, data} = useGraphqlQuery(ACCOUNT_TRANSACTIONS_QUERY, {
    variables: {address: addr64Hash, limit: limit, offset: offset},
    skip: !isGraphqlClientSupported,
  });

  const restQuery = useQuery({
    queryKey: [
      "account_all_transactions_versions",
      {addr64Hash, limit, offset},
      state.network_value,
    ],
    queryFn: async () => {
      if (!addr64Hash) {
        return [];
      }
      const txns = await state.aptos_client.getAccountTransactions(addr64Hash, {
        start: offset,
        limit,
      });
      return txns.map((txn: Types.Transaction) => Number(txn.version));
    },
    enabled: !isGraphqlClientSupported,
  });

  if (isGraphqlClientSupported) {
    if (!addr64Hash || loading || error || !data) {
      return [];
    }
    return data.account_transactions.map(
      (resource: {transaction_version: number}) => {
        return resource.transaction_version;
      },
    );
  }

  if (restQuery.isLoading || restQuery.isError || !restQuery.data) {
    return [];
  }
  return restQuery.data;
}
