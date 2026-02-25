import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useNetworkValue, useSdkV2Client} from "../../../global-config";
import {tryStandardizeAddress} from "../../../utils";

interface NumberOfDelegatorsResponse {
  num_active_delegator: string;
}

const NUMBER_OF_DELEGATORS_QUERY = `
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
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: ["numberOfDelegators", poolAddress64Hash, networkValue],
    queryFn: () =>
      client.queryIndexer<{
        num_active_delegator_per_pool: NumberOfDelegatorsResponse[];
      }>({
        query: {
          query: NUMBER_OF_DELEGATORS_QUERY,
          variables: {poolAddress: poolAddress64Hash},
        },
      }),
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
