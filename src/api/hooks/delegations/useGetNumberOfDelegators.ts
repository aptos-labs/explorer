import {CombinedGraphQLErrors, gql} from "@apollo/client";
import {useQuery as useGraphqlQuery} from "@apollo/client/react";
import {tryStandardizeAddress} from "../../../utils";
import {Types} from "aptos";

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
  error: CombinedGraphQLErrors | undefined;
} {
  const poolAddress64Hash = tryStandardizeAddress(poolAddress);

  const {loading, error, data} = useGraphqlQuery<{
    num_active_delegator_per_pool: NumberOfDelegatorsResponse[];
  }>(NUMBER_OF_DELEGATORS_QUERY, {
    variables: {
      poolAddress: poolAddress64Hash,
    },
    skip: !poolAddress,
  });
  if (!poolAddress64Hash || loading || error || !data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {numberOfDelegators: 0, loading, error: error as any};
  }

  const delegatorData = data?.num_active_delegator_per_pool?.[0] as
    | NumberOfDelegatorsResponse
    | undefined;

  return {
    numberOfDelegators: delegatorData
      ? parseInt(delegatorData.num_active_delegator, 10)
      : 0,
    loading,
    error,
  };
}
