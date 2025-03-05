import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {getValidatorCommissionChange} from "../..";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {ResponseError} from "../../client";
import {MoveValue} from "aptos/src/generated";

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
  const [{aptos_client: client}] = useGlobalState();

  const {
    data: nextCommission,
    isLoading,
    error,
  } = useQuery<Types.MoveValue[], ResponseError, number>({
    queryKey: ["validatorCommissionChange", client, validatorAddress],
    queryFn: () => getValidatorCommissionChange(client, validatorAddress),
    select: (res: MoveValue[]) => Number(res ? res[0] : 0) / 100, // commission rate: 22.85% is represented as 2285
  });

  return {
    nextCommission,
    isQueryLoading: isLoading,
    error,
  };
}
