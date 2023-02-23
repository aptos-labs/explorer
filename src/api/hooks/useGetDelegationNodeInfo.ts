import {gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {AptosClient, Types} from "aptos";
import {useState, useMemo} from "react";
import {getValidatorCommission} from "..";
import {useGlobalState} from "../../GlobalState";
import {ValidatorData} from "./useGetValidators";
import {useGetValidatorSet, Validator} from "./useGetValidatorSet";

type DelegationNodeInfoResponse = {
  delegatedStakeAmount: string;
  networkPercentage?: string;
  commission: number | undefined;
  delegatorBalance: string;
};

type DelegationNodeInfoProps = {
  validatorAddress: Types.Address;
  validator: ValidatorData | Validator;
};

export interface DelegatedStakingActivity {
  amount: number;
  delegator_address: Types.Address;
  event_index: number;
  event_type: string;
  pool_address: Types.Address;
  transaction_version: bigint;
}

const NUMBER_OF_DELEGATORS_QUERY = gql`
  query numberOfDelegatorsQuery($poolAddress: String) {
    current_delegator_balances_aggregate(
      where: {
        pool_type: {_eq: "active_shares"}
        pool_address: {_eq: $poolAddress}
        amount: {_gt: "0"}
      }
      distinct_on: delegator_address
    ) {
      aggregate {
        count
      }
    }
  }
`;

function useGetNumberOfDelegators(poolAddress: Types.Address) {
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
      data?.current_delegator_balances_aggregate?.aggregate?.count,
    loading,
    error,
  };
}

export function useGetDelegationNodeInfo({
  validatorAddress,
  validator,
}: DelegationNodeInfoProps): DelegationNodeInfoResponse {
  const [state, _] = useGlobalState();
  const [commission, setCommission] = useState<Types.MoveValue>();
  const client = new AptosClient(state.network_value);
  const {totalVotingPower} = useGetValidatorSet();
  const [networkPercentage, setNetworkPercentage] = useState<string>();
  const {delegatorBalance} = useGetNumberOfDelegators(validatorAddress);

  useMemo(() => {
    const fetchData = async () => {
      setCommission(await getValidatorCommission(client, validatorAddress));
    };
    fetchData();
    setNetworkPercentage(
      (
        (parseInt(validator.voting_power) / parseInt(totalVotingPower!)) *
        100
      ).toFixed(2),
    );
  }, [state.network_value, totalVotingPower]);

  return {
    commission: commission ? Number(commission) / 100 : undefined, // commission rate: 22.85% is represented as 2285
    networkPercentage,
    delegatedStakeAmount: validator.voting_power,
    delegatorBalance,
  };
}
