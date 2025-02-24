import {useGraphqlQueryAll} from "./useGraphqlQueryPaginated";
import {useGlobalState} from "../../global-config/GlobalConfig";

export interface DelegatedStakingPool {
  staking_pool_address: string;
  current_staking_pool: {
    operator_address: string;
  };
}

const NEW_VALIDATOR_LIST_QUERY = `
  query DelegationPools($offset: Int, $limit: Int) {
    delegated_staking_pools(limit: $limit, offset: $offset) {
      staking_pool_address
      current_staking_pool {
        operator_address
      }
    }
  }
`;

export function useGetDelegatedStakingPoolList(): {
  delegatedStakingPools: DelegatedStakingPool[];
  loading: boolean;
} {
  const [globalState] = useGlobalState();
  // TODO: Make a better type
  const {
    data,
    error,
    isLoading: loading,
  } = useGraphqlQueryAll<{delegated_staking_pools: DelegatedStakingPool[]}>(
    globalState.sdk_v2_client,
    NEW_VALIDATOR_LIST_QUERY,
    100,
    2, // TODO: Make more dynamic, right now there's only 110 pools
    {},
  );
  if (error) {
    return {delegatedStakingPools: [], loading};
  }

  // Combine into one
  const delegatedStakingPools =
    data?.flatMap((data) => data.delegated_staking_pools) ?? [];

  return {
    delegatedStakingPools,
    loading,
  };
}
