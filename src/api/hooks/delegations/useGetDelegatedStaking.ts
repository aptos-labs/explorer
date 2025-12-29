import {CombinedGraphQLErrors, gql} from "@apollo/client";
import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {Types} from "aptos";
import {tryStandardizeAddress} from "../../../utils";

export interface DelegatorPoolInfo {
  delegator_address: string;
  pool_address: string;
  current_pool_balance: {
    operator_commission_percentage: string;
  };
  staking_pool_metadata: {
    operator_address: string;
    operator_aptos_name?: {
      domain: string;
    };
  };
}

const DELEGATED_STAKING_QUERY = gql`
  query getDelegatedStaking($address: String!) {
    delegator_distinct_pool(where: {delegator_address: {_eq: $address}}) {
      delegator_address
      pool_address
      current_pool_balance {
        operator_commission_percentage
      }
      staking_pool_metadata {
        operator_address
        operator_aptos_name {
          domain
        }
      }
    }
  }
`;

export function useGetDelegatedStaking(
  delegatorAddress: Types.Address | undefined,
): {
  delegatorPools: DelegatorPoolInfo[] | undefined;
  loading: boolean;
  error: CombinedGraphQLErrors | undefined;
} {
  const delegatorAddress64Hash =
    tryStandardizeAddress(delegatorAddress) ?? "N/A";

  const {loading, error, data} = useGraphqlQuery<{
    delegator_distinct_pool: DelegatorPoolInfo[];
  }>(DELEGATED_STAKING_QUERY, {
    variables: {
      address: delegatorAddress64Hash,
    },
  });

  return {
    delegatorPools: data?.delegator_distinct_pool,
    loading,
    error: error ? (error as CombinedGraphQLErrors) : undefined,
  };
}
