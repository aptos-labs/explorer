import {useQuery} from "@tanstack/react-query";
import {gql, GraphQLClient} from "graphql-request";
import {useGetGraphqlClient} from "../useGraphqlClient";

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
  client: GraphQLClient,
): Promise<DelegatedStakingPool[]> {
  const LIMIT = 100;
  let offset = 0;
  let hasMore = true;
  let allPools: DelegatedStakingPool[] = [];

  while (hasMore) {
    const result = await client.request<{
      delegated_staking_pools: DelegatedStakingPool[];
    }>(VALIDATOR_LIST_QUERY, {limit: LIMIT, offset});

    const pools = result?.delegated_staking_pools ?? [];

    if (pools.length > 0) {
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
  error?: Error;
} {
  const client = useGetGraphqlClient();

  const {data, isLoading, error} = useQuery({
    queryKey: ["delegationPools"],
    queryFn: () => fetchAllDelegationPools(client),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    delegatedStakingPools: data || [],
    loading: isLoading,
    error: error ? (error as Error) : undefined,
  };
}
