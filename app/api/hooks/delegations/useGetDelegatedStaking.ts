import {useQuery} from "@tanstack/react-query";
import {gql} from "graphql-request";
import {Types} from "~/types/aptos";
import {tryStandardizeAddress} from "../../../utils";
import {useGetGraphqlClient} from "../useGraphqlClient";
import {useNetworkValue} from "../../../global-config";

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
  error: Error | undefined;
} {
  const delegatorAddress64Hash =
    tryStandardizeAddress(delegatorAddress) ?? "N/A";
  const client = useGetGraphqlClient();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: ["delegatedStaking", delegatorAddress64Hash, networkValue],
    queryFn: () =>
      client.request<{
        delegator_distinct_pool: DelegatorPoolInfo[];
      }>(DELEGATED_STAKING_QUERY, {address: delegatorAddress64Hash}),
    enabled: !!delegatorAddress,
  });

  return {
    delegatorPools: data?.delegator_distinct_pool,
    loading: isLoading,
    error: error ? (error as Error) : undefined,
  };
}
