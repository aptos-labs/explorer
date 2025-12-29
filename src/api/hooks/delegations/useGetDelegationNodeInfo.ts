import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {getValidatorCommission, getValidatorState} from "../..";
import {useAptosClient} from "../../../global-config/GlobalConfig";
import {ResponseError} from "../../client";
import {combineQueries} from "../../query-utils";
import {useGetNumberOfDelegators} from "./useGetNumberOfDelegators";
import {CombinedGraphQLErrors} from "@apollo/client";

type DelegationNodeInfoProps = {
  validatorAddress: Types.Address;
};

type DelegationNodeInfoResponse = {
  commission: number | undefined;
  commissionNextCycle?: number | undefined;
  isQueryLoading: boolean;
  validatorStatus: Types.MoveValue[] | undefined;
  numberOfDelegators?: number;
  error: ResponseError | CombinedGraphQLErrors | null;
};

export function useGetDelegationNodeInfo({
  validatorAddress,
}: DelegationNodeInfoProps): DelegationNodeInfoResponse {
  const client = useAptosClient();

  // Validate validatorAddress
  const isValidAddress = !!validatorAddress && validatorAddress.length > 0;

  // Get number of delegators
  const {
    numberOfDelegators,
    loading: delegatorsLoading,
    error: delegatorsError,
  } = useGetNumberOfDelegators(isValidAddress ? validatorAddress : "");

  const {
    combinedQueryState,
    queries: [validatorCommissionQuery, validatorStateQuery],
  } = combineQueries([
    useQuery<Types.MoveValue[], ResponseError, number>({
      queryKey: ["validatorCommission", client, validatorAddress],
      queryFn: () => getValidatorCommission(client, validatorAddress),
      select: (res) => Number(res ? res[0] : 0) / 100, // commission rate: 22.85% is represented as 2285
      enabled: !!client && isValidAddress,
    }),
    useQuery<Types.MoveValue[], ResponseError>({
      queryKey: ["validatorState", client, validatorAddress],
      queryFn: () => getValidatorState(client, validatorAddress),
      enabled: !!client && isValidAddress,
    }),
  ]);

  return {
    isQueryLoading: combinedQueryState.isLoading || delegatorsLoading,
    error: combinedQueryState.error || delegatorsError || null,
    commission: validatorCommissionQuery.data,
    validatorStatus: validatorStateQuery.data,
    numberOfDelegators,
  };
}
