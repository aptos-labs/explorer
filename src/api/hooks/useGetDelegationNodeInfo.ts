import {AptosClient, Types} from "aptos";
import {useState, useMemo} from "react";
import {getValidatorCommission, getValidatorState} from "..";
import {useGlobalState} from "../../GlobalState";
import {useGetAccountResource} from "./useGetAccountResource";
import {useGetValidatorSet} from "./useGetValidatorSet";

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
  validatorStatus: Types.MoveValue[] | undefined;
};

type DelegationNodeInfoProps = {
  validatorAddress: Types.Address;
};

export function useGetDelegationNodeInfo({
  validatorAddress,
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
  const [validatorStatus, setValidatorStatus] = useState<Types.MoveValue[]>();

  useMemo(() => {
    if (!isLoading) {
      const fetchData = async () => {
        setCommission(await getValidatorCommission(client, validatorAddress));
        setValidatorStatus(await getValidatorState(client, validatorAddress));
      };
      fetchData();
      const totalDelegatedStakeAmount = (delegationPool?.data as DelegationPool)
        ?.active_shares?.total_coins;
      setNetworkPercentage(
        (
          (parseInt(totalDelegatedStakeAmount) / parseInt(totalVotingPower!)) *
          100
        ).toFixed(2),
      );
      setDelegatedStakeAmount(totalDelegatedStakeAmount);
      setIsQueryLoading(false);
    }
  }, [state.network_value, totalVotingPower, isLoading, delegationPool]);

  return {
    commission: commission ? Number(commission[0]) / 100 : undefined, // commission rate: 22.85% is represented as 2285
    networkPercentage,
    delegatedStakeAmount,
    isQueryLoading,
    validatorStatus,
  };
}
