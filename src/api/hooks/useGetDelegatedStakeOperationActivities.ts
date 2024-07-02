import {ApolloError, gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {normalizeAddress} from "../../utils";

export interface DelegatedStakingActivity {
  amount: number;
  delegator_address: string;
  event_index: number;
  event_type: string;
  pool_address: string;
  transaction_version: bigint;
}

const DELEGATED_STAKING_ACTIVITY_QUERY = gql`
  query delegatedStakingActivities(
    $delegatorAddress: String
    $poolAddress: String
  ) {
    delegated_staking_activities(
      where: {
        delegator_address: {_eq: $delegatorAddress}
        pool_address: {_eq: $poolAddress}
      }
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
  delegatorAddress: string,
  poolAddress: string,
): {
  activities: DelegatedStakingActivity[] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
} {
  const delegatorAddress64Hash = normalizeAddress(delegatorAddress);
  const poolAddress64Hash = normalizeAddress(poolAddress);

  const {loading, error, data} = useGraphqlQuery(
    DELEGATED_STAKING_ACTIVITY_QUERY,
    {
      variables: {
        delegatorAddress: delegatorAddress64Hash,
        poolAddress: poolAddress64Hash,
      },
    },
  );

  return {activities: data?.delegated_staking_activities, loading, error};
}
