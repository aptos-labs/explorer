import {gql, useQuery} from "@apollo/client";

const TOKEN_ACTIVITIES_COUNT_QUERY = gql`
  query TokenActivitiesCount($token_id: String) {
    token_activities_aggregate(where: {token_data_id_hash: {_eq: $token_id}}) {
      aggregate {
        count
      }
    }
  }
`;

export function useGetTokensActivitiesCount(tokenDataIdHash: string) {
  const {loading, error, data} = useQuery(TOKEN_ACTIVITIES_COUNT_QUERY, {
    variables: {
      token_id: tokenDataIdHash,
    },
  });

  if (loading || error || !data) {
    return undefined;
  }

  return data?.token_activities_aggregate?.aggregate?.count;
}

const TOKEN_ACTIVITIES_QUERY = gql`
  query TokenActivities($token_id: String, $limit: Int, $offset: Int) {
    token_activities(
      where: {token_data_id_hash: {_eq: $token_id}}
      order_by: {transaction_version: desc}
      limit: $limit
      offset: $offset
    ) {
      transaction_version
      from_address
      property_version
      to_address
      token_amount
      transfer_type
    }
  }
`;

export function useGetTokensActivities(
  tokenDataIdHash: string,
  limit: number,
  offset?: number,
) {
  const {loading, error, data} = useQuery(TOKEN_ACTIVITIES_QUERY, {
    variables: {
      token_id: tokenDataIdHash,
      limit: limit,
      offset: offset,
    },
  });

  if (loading || error || !data) {
    return [];
  }

  return data?.token_activities ?? [];
}
