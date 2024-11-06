import {useQuery} from "@tanstack/react-query";
import {getValidatorCommission, getValidatorState} from "../v2";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {ResponseError} from "../client";
import {combineQueries} from "../query-utils";
import {AccountAddressInput, MoveValue} from "@aptos-labs/ts-sdk";

type DelegationNodeInfoResponse = {
  commission: number | undefined;
  isQueryLoading: boolean;
  validatorStatus: MoveValue[] | undefined;
  error: ResponseError | null;
};

type DelegationNodeInfoProps = {
  validatorAddress: AccountAddressInput;
};

export function useGetDelegationNodeInfo({
  validatorAddress,
}: DelegationNodeInfoProps): DelegationNodeInfoResponse {
  const [{sdk_v2_client: client}] = useGlobalState();

  const {
    combinedQueryState,
    queries: [validatorCommissionQuery, validatorStateQuery],
  } = combineQueries([
    useQuery<MoveValue[], ResponseError, number>({
      queryKey: ["validatorCommission", client, validatorAddress],
      queryFn: () => getValidatorCommission(client, validatorAddress),
      select: (res: MoveValue[]) => Number(res ? res[0] : 0) / 100, // commission rate: 22.85% is represented as 2285
    }),
    useQuery<MoveValue[], ResponseError>({
      queryKey: ["validatorState", client, validatorAddress],
      queryFn: () => getValidatorState(client, validatorAddress),
    }),
  ]);

  return {
    isQueryLoading: combinedQueryState.isLoading,
    error: combinedQueryState.error,
    commission: validatorCommissionQuery.data,
    validatorStatus: validatorStateQuery.data,
  };
}
