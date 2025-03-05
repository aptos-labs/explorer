import {ApolloError, gql, useQuery as useGraphqlQuery} from "@apollo/client";

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
  query DelegationPools {
    delegated_staking_pools {
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

export function useGetDelegatedStakingPoolList(): {
  delegatedStakingPools: DelegatedStakingPool[];
  loading: boolean;
  error?: ApolloError;
} {
  const {data, error, loading} = useGraphqlQuery(VALIDATOR_LIST_QUERY);
  if (error) {
    return {delegatedStakingPools: [], loading, error};
  }

  return {
    delegatedStakingPools:
      data?.delegated_staking_pools as DelegatedStakingPool[],
    loading,
    error,
  };
}
