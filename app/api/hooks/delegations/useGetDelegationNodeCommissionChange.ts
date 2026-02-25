import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient} from "../../../global-config";
import {getValidatorCommissionChange} from "../..";
import type {ResponseError} from "../../client";

type DelegationNodeCommissionChangeProps = {
  validatorAddress: Types.Address;
};

type DelegationNodeInfoResponse = {
  nextCommission: number | undefined;
  isQueryLoading: boolean;
  error: ResponseError | null;
};

export function useGetDelegationNodeCommissionChange({
  validatorAddress,
}: DelegationNodeCommissionChangeProps): DelegationNodeInfoResponse {
  const client = useAptosClient();

  const {
    data: nextCommission,
    isLoading,
    error,
  } = useQuery<Types.MoveValue[], ResponseError, number>({
    queryKey: ["validatorCommissionChange", client, validatorAddress],
    queryFn: () => getValidatorCommissionChange(client, validatorAddress),
    select: (res) => Number(res ? res[0] : 0) / 100, // commission rate: 22.85% is represented as 2285
  });

  return {
    nextCommission,
    isQueryLoading: isLoading,
    error,
  };
}
