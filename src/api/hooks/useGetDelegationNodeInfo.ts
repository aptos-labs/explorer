import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {getValidatorCommission, getValidatorState} from "..";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {ResponseError} from "../client";
import {combineQueries} from "../query-utils";
import {useGetAccountResource} from "./useGetAccountResource";
import {useGetValidatorSet} from "./useGetValidatorSet";
import {MoveValue} from "aptos/src/generated";

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
  error: ResponseError | null;
};

type DelegationNodeInfoProps = {
  validatorAddress: Types.Address;
};

export function useGetDelegationNodeInfo({
  validatorAddress,
}: DelegationNodeInfoProps): DelegationNodeInfoResponse {
  const [{aptos_client: client}, _] = useGlobalState();
  const {totalVotingPower} = useGetValidatorSet();

  const {
    combinedQueryState,
    queries: [
      delegationPoolQuery,
      validatorCommissionQuery,
      validatorStateQuery,
    ],
  } = combineQueries([
    useGetAccountResource(
      validatorAddress,
      "0x1::delegation_pool::DelegationPool",
    ),
    useQuery<Types.MoveValue[], ResponseError, number>({
      queryKey: ["validatorCommission", client, validatorAddress],
      queryFn: () => getValidatorCommission(client, validatorAddress),
      select: (commisionData: MoveValue[]) => Number(commisionData[0]) / 100, // commission rate: 22.85% is represented as 2285
    }),
    useQuery<Types.MoveValue[], ResponseError>(
      ["validatorState", client, validatorAddress],
      () => getValidatorState(client, validatorAddress),
    ),
  ]);

  const delegatedStakeAmount = (
    delegationPoolQuery.data?.data as undefined | DelegationPool
  )?.active_shares?.total_coins;

  const networkPercentage = (
    (parseInt(delegatedStakeAmount!, 10) / parseInt(totalVotingPower!, 10)) *
    100
  ).toFixed(2);

  return {
    isQueryLoading: combinedQueryState.isLoading,
    error: combinedQueryState.error,
    commission: validatorCommissionQuery.data,
    validatorStatus: validatorStateQuery.data,
    networkPercentage,
    delegatedStakeAmount,
  };
}
