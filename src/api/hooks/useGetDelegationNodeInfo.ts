import {AptosClient, Types} from "aptos";
import {useState, useMemo} from "react";
import {getValidatorCommission} from "..";
import {DELEGATION_POOL_ADDRESS} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import {useGetAccountResources} from "./useGetAccountResources";
import {ValidatorData} from "./useGetValidators";
import {useGetValidatorSet, Validator} from "./useGetValidatorSet";

interface DelegationPool {
  active_shares: {
    total_coins: string;
  };
}

type DelegationNodeInfoResponse = {
  delegatedStakeAmount: string | undefined;
  networkPercentage?: string;
  commission: number | undefined;
  isLoading: boolean;
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
  const {data, isLoading} = useGetAccountResources(validatorAddress);
  const client = new AptosClient(state.network_value);
  const [commission, setCommission] = useState<Types.MoveValue>();
  const [delegatedStakeAmount, setDelegatedStakeAmount] =
    useState<Types.MoveValue>();
  const [networkPercentage, setNetworkPercentage] = useState<string>();

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

      const delegationPool = data?.find(
        (resource) =>
          resource.type ===
          `${DELEGATION_POOL_ADDRESS}::delegation_pool::DelegationPool`,
      );

      const delegationPoolData: DelegationPool | undefined =
        delegationPool?.data as DelegationPool;

      setDelegatedStakeAmount(delegationPoolData?.active_shares?.total_coins);
    }
  }, [state.network_value, totalVotingPower, isLoading, data]);

  return {
    commission: commission ? Number(commission) / 100 : undefined, // commission rate: 22.85% is represented as 2285
    networkPercentage,
    delegatedStakeAmount: delegatedStakeAmount
      ? Number(delegatedStakeAmount).toString()
      : undefined,
    isLoading,
  };
}
