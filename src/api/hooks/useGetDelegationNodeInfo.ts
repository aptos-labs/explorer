import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {getValidatorCommission, getValidatorState} from "..";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {ResponseError} from "../client";
import {combineQueries} from "../query-utils";
import {MoveValue} from "aptos/src/generated";

type DelegationNodeInfoResponse = {
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
  const [{aptos_client: client}] = useGlobalState();

  const {
    combinedQueryState,
    queries: [validatorCommissionQuery, validatorStateQuery],
  } = combineQueries([
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

  return {
    isQueryLoading: combinedQueryState.isLoading,
    error: combinedQueryState.error,
    commission: validatorCommissionQuery.data,
    validatorStatus: validatorStateQuery.data,
  };
}
