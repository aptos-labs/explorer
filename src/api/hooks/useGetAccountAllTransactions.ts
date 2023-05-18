import {gql, useQuery as useGraphqlQuery} from "@apollo/client";

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
  const addr64Hash = "0x" + address.substring(2).padStart(64, "0");

  const {loading, error, data} = useGraphqlQuery(
    ACCOUNT_TRANSACTIONS_COUNT_QUERY,
    {variables: {address: addr64Hash}},
  );
  console.log(error);
  if (loading || error || !data) {
    return undefined;
  }

  return data.move_resources_aggregate?.aggregate?.count;
}

const ACCOUNT_TRANSACTIONS_QUERY = gql`
  query AccountTransactionsData($address: String, $limit: Int, $offset: Int) {
    address_version_from_move_resources(
      where: {address: {_eq: $address}}
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
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const addr64Hash = "0x" + address.substring(2).padStart(64, "0");

  const {loading, error, data} = useGraphqlQuery(ACCOUNT_TRANSACTIONS_QUERY, {
    variables: {address: addr64Hash, limit: limit, offset: offset},
  });

  if (loading || error || !data) {
    return [];
  }

  const versions: number[] = data.address_version_from_move_resources.map(
    (resource: {transaction_version: number}) => {
      return resource.transaction_version;
    },
  );

  return versions;
}
