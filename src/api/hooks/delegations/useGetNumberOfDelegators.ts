import {ApolloError, gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {standardizeAddress} from "../../../utils";
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
  error: ApolloError | undefined;
} {
  const poolAddress64Hash = poolAddress ? standardizeAddress(poolAddress) : "";

  const {loading, error, data} = useGraphqlQuery(NUMBER_OF_DELEGATORS_QUERY, {
    variables: {
      poolAddress: poolAddress64Hash,
    },
    skip: !poolAddress,
  });

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
