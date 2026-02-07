import {useQuery} from "@tanstack/react-query";
import {gql} from "graphql-request";
import {tryStandardizeAddress} from "../../../utils";
import {Types} from "~/types/aptos";
import {useGetGraphqlClient} from "../useGraphqlClient";
import {useNetworkValue} from "../../../global-config";

interface NumberOfDelegatorsResponse {
  num_active_delegator: string;
}

const NUMBER_OF_DELEGATORS_QUERY = gql`
  query getNumberOfDelegators($poolAddress: String) {
    num_active_delegator_per_pool(
      where: {
        pool_address: {_eq: $poolAddress}
        num_active_delegator: {_gt: "0"}
      }
      distinct_on: pool_address
    ) {
      num_active_delegator
    }
  }
`;

export function useGetNumberOfDelegators(poolAddress: Types.Address): {
  numberOfDelegators: number;
  loading: boolean;
  error: Error | undefined;
} {
  const poolAddress64Hash = tryStandardizeAddress(poolAddress);
  const client = useGetGraphqlClient();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: ["numberOfDelegators", poolAddress64Hash, networkValue],
    queryFn: () =>
      client.request<{
        num_active_delegator_per_pool: NumberOfDelegatorsResponse[];
      }>(NUMBER_OF_DELEGATORS_QUERY, {poolAddress: poolAddress64Hash}),
    enabled: !!poolAddress && !!poolAddress64Hash,
  });

  if (!poolAddress64Hash || isLoading || error || !data) {
    return {
      numberOfDelegators: 0,
      loading: isLoading,
      error: error ? (error as Error) : undefined,
    };
  }

  const delegatorData = data?.num_active_delegator_per_pool?.[0] as
    | NumberOfDelegatorsResponse
    | undefined;

  return {
    numberOfDelegators: delegatorData
      ? parseInt(delegatorData.num_active_delegator, 10)
      : 0,
    loading: isLoading,
    error: undefined,
  };
}
