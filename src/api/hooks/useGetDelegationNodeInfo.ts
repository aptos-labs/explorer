import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {
  getValidatorCommission,
  getValidatorCommissionChange,
  getValidatorState,
} from "..";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {ResponseError} from "../client";
import {combineQueries} from "../query-utils";
import {MoveValue} from "aptos/src/generated";

type DelegationNodeInfoResponse = {
  commission: number | undefined;
  nextCommission: number | undefined;
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
  const [{aptos_client: client}] = useGlobalState();

  const {
    combinedQueryState,
    queries: [
      validatorCommissionQuery,
      validatorStateQuery,
      validatorCommissionChangeQuery,
    ],
  } = combineQueries([
    useQuery<Types.MoveValue[], ResponseError, number>({
      queryKey: ["validatorCommission", client, validatorAddress],
      queryFn: () => getValidatorCommission(client, validatorAddress),
      select: (commissionData: MoveValue[]) => Number(commissionData[0]) / 100, // commission rate: 22.85% is represented as 2285
    }),
    useQuery<Types.MoveValue[], ResponseError>(
      ["validatorState", client, validatorAddress],
      () => getValidatorState(client, validatorAddress),
    ),
    useQuery<Types.MoveValue[], ResponseError, number>({
      queryKey: ["validatorCommissionChange", client, validatorAddress],
      queryFn: () => getValidatorCommissionChange(client, validatorAddress),
      select: (commissionData: MoveValue[]) => Number(commissionData[0]) / 100, // commission rate: 22.85% is represented as 2285
    }),
  ]);

  return {
    isQueryLoading: combinedQueryState.isLoading,
    error: combinedQueryState.error,
    commission: validatorCommissionQuery.data,
    nextCommission: validatorCommissionChangeQuery.data,
    validatorStatus: validatorStateQuery.data,
  };
}
