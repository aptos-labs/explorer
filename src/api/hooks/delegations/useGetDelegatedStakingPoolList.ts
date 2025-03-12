import {
  ApolloError,
  gql,
  useQuery as useGraphqlQuery,
  ApolloClient,
  NormalizedCacheObject,
} from "@apollo/client";
import {useQuery} from "@tanstack/react-query";

export interface DelegatedStakingPool {
  staking_pool_address: string;
  current_staking_pool: {
    operator_address: string;
    operator_aptos_name?: {
      domain: string;
      is_primary: boolean;
    };
  };
}

const VALIDATOR_LIST_QUERY = gql`
  query DelegationPools($limit: Int!, $offset: Int!) {
    delegated_staking_pools(limit: $limit, offset: $offset) {
      staking_pool_address
      current_staking_pool {
        operator_address
        operator_aptos_name {
          domain
          is_primary
        }
      }
    }
  }
`;

async function fetchAllDelegationPools(
  apolloClient: ApolloClient<NormalizedCacheObject>,
): Promise<DelegatedStakingPool[]> {
  const LIMIT = 100;
  let offset = 0;
  let hasMore = true;
  let allPools: DelegatedStakingPool[] = [];

  while (hasMore) {
    const result = await apolloClient.query({
      query: VALIDATOR_LIST_QUERY,
      variables: {
        limit: LIMIT,
        offset: offset,
      },
    });

    const pools = result.data.delegated_staking_pools;

    if (pools && pools.length > 0) {
      allPools = [...allPools, ...pools];

      if (pools.length < LIMIT) {
        hasMore = false;
      } else {
        offset += LIMIT;
      }
    } else {
      hasMore = false;
    }
  }

  return allPools;
}

export function useGetDelegatedStakingPoolList(): {
  delegatedStakingPools: DelegatedStakingPool[];
  loading: boolean;
  error?: ApolloError;
} {
  const {client, error: apolloError} = useGraphqlQuery(VALIDATOR_LIST_QUERY, {
    skip: true,
  });

  const {data, isLoading, error} = useQuery({
    queryKey: ["delegationPools"],
    queryFn: () => fetchAllDelegationPools(client),
    enabled: !!client,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (apolloError || error) {
    return {
      delegatedStakingPools: [],
      loading: isLoading,
      error: apolloError || (error as ApolloError),
    };
  }

  return {
    delegatedStakingPools: data || [],
    loading: isLoading,
    error: undefined,
  };
}
