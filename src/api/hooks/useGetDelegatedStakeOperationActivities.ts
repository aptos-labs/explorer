import {ApolloError, gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {Types} from "aptos";

export interface DelegatedStakingActivity {
  amount: number;
  delegator_address: Types.Address;
  event_index: number;
  event_type: string;
  pool_address: Types.Address;
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
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const delegatorAddress64Hash =
    "0x" + delegatorAddress.substring(2).padStart(64, "0");
  const poolAddress64Hash = "0x" + poolAddress.substring(2).padStart(64, "0");

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
