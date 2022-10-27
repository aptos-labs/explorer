import {gql, useQuery as useGraphqlQuery} from "@apollo/client";

const ACCOUNT_TOKENS_COUNT_QUERY = gql`
query AccountTokensCount($owner_address: String) {
    current_token_ownerships_aggregate(
      where: {owner_address: {_eq: $owner_address}, amount: {_gt: "0"}}
    ) {
      aggregate {
        count
      }
    }
  }
`;

export function useGetAccountTokensCount(
    address: string,
  ) {
    // whenever talking to the indexer, the address needs to fill in leading 0s
    // for example: 0x123 => 0x000...000123  (61 0s before 123)
    const addr64Hash = "0x" + address.substring(2).padStart(64, "0");
  
    const {loading, error, data} = useGraphqlQuery(ACCOUNT_TOKENS_COUNT_QUERY, {
      variables: {owner_address: addr64Hash},
    });
  
    if (loading || error || !data) {
      return undefined;
    }
  
    return data?.current_token_ownerships_aggregate?.aggregate?.count;
  }
  

const ACCOUNT_TOKENS_QUERY = gql`
  query AccountTokensData($owner_address: String, $limit: Int, $offset: Int) {
    current_token_ownerships(
      where: {owner_address: {_eq: $owner_address}, amount: {_gt: "0"}}
      limit: $limit
      offset: $offset
    ) {
      token_data_id_hash
      name
      collection_name
      table_type
      property_version
      amount
    }
  }
`;

export function useGetAccountTokens(
  address: string,
  limit: number,
  offset?: number,
) {
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const addr64Hash = "0x" + address.substring(2).padStart(64, "0");

  const {loading, error, data} = useGraphqlQuery(ACCOUNT_TOKENS_QUERY, {
    variables: {owner_address: addr64Hash, limit: limit, offset: offset},
  });

  if (loading || error || !data) {
    return [];
  }

  return data?.current_token_ownerships ?? [];
}
