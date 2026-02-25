import type {Aptos} from "@aptos-labs/ts-sdk";
import {useQuery} from "@tanstack/react-query";
import {useNetworkValue, useSdkV2Client} from "../../../global-config";

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

const VALIDATOR_LIST_QUERY = `
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
  client: Aptos,
): Promise<DelegatedStakingPool[]> {
  const LIMIT = 100;
  let offset = 0;
  let hasMore = true;
  let allPools: DelegatedStakingPool[] = [];

  while (hasMore) {
    const result = await client.queryIndexer<{
      delegated_staking_pools: DelegatedStakingPool[];
    }>({
      query: {
        query: VALIDATOR_LIST_QUERY,
        variables: {limit: LIMIT, offset},
      },
    });

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
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {data, isLoading, error} = useQuery({
    queryKey: ["delegationPools", networkValue],
    queryFn: () => fetchAllDelegationPools(client),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    delegatedStakingPools: data || [],
    loading: isLoading,
    error: error ? (error as Error) : undefined,
  };
}
