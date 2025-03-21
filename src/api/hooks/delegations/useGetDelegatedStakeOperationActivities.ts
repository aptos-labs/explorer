import {ApolloError, gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {Types} from "aptos";
import {tryStandardizeAddress} from "../../../utils";

export interface DelegatedStakingActivity {
  amount: number;
  delegator_address: Types.Address;
  event_index: number;
  event_type: string;
  pool_address: Types.Address;
  transaction_version: bigint;
}

const DELEGATED_STAKING_ACTIVITY_QUERY = gql`
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
  error: ApolloError | undefined;
} {
  const delegatorAddress64Hash = tryStandardizeAddress(delegatorAddress);
  const poolAddress64Hash = tryStandardizeAddress(poolAddress);

  const {loading, error, data} = useGraphqlQuery(
    DELEGATED_STAKING_ACTIVITY_QUERY,
    {
      variables: {
        address: delegatorAddress64Hash,
        pool: poolAddress64Hash,
      },
    },
  );
  if (
    !delegatorAddress64Hash ||
    !poolAddress64Hash ||
    loading ||
    error ||
    !data
  ) {
    return {activities: undefined, loading, error};
  }

  return {activities: data?.delegated_staking_activities, loading, error};
}
