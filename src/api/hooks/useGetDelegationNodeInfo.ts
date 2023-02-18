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
};

type DelegationNodeInfoProps = {
  validatorAddress: Types.Address;
  validator: ValidatorData | Validator;
};

export function useGetDelegationNodeInfo({
  validatorAddress,
  validator,
}: DelegationNodeInfoProps): DelegationNodeInfoResponse {
  const [state, _] = useGlobalState();
  const [commission, setCommission] = useState<Types.MoveValue>();
  const client = new AptosClient(state.network_value);
  const {totalVotingPower} = useGetValidatorSet();
  const [networkPercentage, setNetworkPercentage] = useState<string>();

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
  };
}
