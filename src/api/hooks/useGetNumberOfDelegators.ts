import {Types} from "aptos";
import {gql, useQuery as useGraphqlQuery} from "@apollo/client";

const NUMBER_OF_DELEGATORS_QUERY = gql`
  query numberOfDelegatorsQuery($poolAddress: String) {
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

export function useGetNumberOfDelegators(poolAddress: Types.Address) {
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const poolAddress64Hash = "0x" + poolAddress.substring(2).padStart(64, "0");

  const {loading, error, data} = useGraphqlQuery(NUMBER_OF_DELEGATORS_QUERY, {
    variables: {
      poolAddress: poolAddress64Hash,
    },
  });

  return {
    delegatorBalance:
      data?.num_active_delegator_per_pool?.length > 0
        ? data?.num_active_delegator_per_pool[0].num_active_delegator
        : 0,
    loading,
    error,
  };
}
