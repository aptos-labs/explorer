import {useQuery} from "@tanstack/react-query";
import {Types} from "~/types/aptos";
import {tryStandardizeAddress} from "../../../utils";
import {useNetworkValue, useSdkV2Client} from "../../../global-config";

export interface DelegatedStakingActivity {
  amount: number;
  delegator_address: Types.Address;
  event_index: number;
  event_type: string;
  pool_address: Types.Address;
  transaction_version: bigint;
}

const DELEGATED_STAKING_ACTIVITY_QUERY = `
  query getDelegatedStakingActivities($address: String!, $pool: String) {
    delegated_staking_activities(
      where: {delegator_address: {_eq: $address}, pool_address: {_eq: $pool}}
      order_by: {transaction_version: desc}
    ) {
      amount
      delegator_address
      event_index
      event_type
      pool_address
      transaction_version
    }
  }
`;

export function useGetDelegatedStakeOperationActivities(
  delegatorAddress: Types.Address,
  poolAddress: Types.Address,
): {
  activities: DelegatedStakingActivity[] | undefined;
  loading: boolean;
  error: Error | undefined;
} {
  const delegatorAddress64Hash = tryStandardizeAddress(delegatorAddress);
  const poolAddress64Hash = tryStandardizeAddress(poolAddress);
  const client = useSdkV2Client();
  const networkValue = useNetworkValue();

  const {isLoading, error, data} = useQuery({
    queryKey: [
      "delegatedStakeActivities",
      delegatorAddress64Hash,
      poolAddress64Hash,
      networkValue,
    ],
    queryFn: () =>
      client.queryIndexer<{
        delegated_staking_activities: DelegatedStakingActivity[];
      }>({
        query: {
          query: DELEGATED_STAKING_ACTIVITY_QUERY,
          variables: {
            address: delegatorAddress64Hash,
            pool: poolAddress64Hash,
          },
        },
      }),
    enabled: !!delegatorAddress64Hash && !!poolAddress64Hash,
  });

  return {
    activities: data?.delegated_staking_activities,
    loading: isLoading,
    error: error ? (error as Error) : undefined,
  };
}
