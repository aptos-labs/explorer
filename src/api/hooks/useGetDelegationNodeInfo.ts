import {AptosClient, Types} from "aptos";
import {useState, useMemo} from "react";
import {getValidatorCommission} from "..";
import {useGlobalState} from "../../GlobalState";
import {useGetAccountResource} from "./useGetAccountResource";
import {ValidatorData} from "./useGetValidators";
import {useGetValidatorSet, Validator} from "./useGetValidatorSet";

interface DelegationPool {
  active_shares: {
    total_coins: string;
  };
}

type DelegationNodeInfoResponse = {
  delegatedStakeAmount: string | undefined;
  networkPercentage: string | undefined;
  commission: number | undefined;
  isQueryLoading: boolean;
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
  const {totalVotingPower} = useGetValidatorSet();
  const {data: delegationPool, isLoading} = useGetAccountResource(
    validatorAddress,
    "0x1::delegation_pool::DelegationPool",
  );
  const client = new AptosClient(state.network_value);
  const [commission, setCommission] = useState<Types.MoveValue[]>();
  const [delegatedStakeAmount, setDelegatedStakeAmount] = useState<string>();
  const [networkPercentage, setNetworkPercentage] = useState<string>();
  const [isQueryLoading, setIsQueryLoading] = useState<boolean>(true);

  useMemo(() => {
    if (!isLoading) {
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

      setDelegatedStakeAmount(
        (delegationPool?.data as DelegationPool)?.active_shares?.total_coins,
      );
      setIsQueryLoading(false);
    }
  }, [state.network_value, totalVotingPower, isLoading, delegationPool]);

  return {
    commission: commission ? Number(commission[0]) / 100 : undefined, // commission rate: 22.85% is represented as 2285
    networkPercentage,
    delegatedStakeAmount,
    isQueryLoading,
  };
}
