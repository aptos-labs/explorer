import {useQuery} from "@tanstack/react-query";
import {Types} from "aptos";
import {getValidatorCommissionChange} from "..";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {ResponseError} from "../client";
import {MoveValue} from "aptos/src/generated";

type DelegationNodeInfoResponse = {
  nextCommission: number | undefined;
  isQueryLoading: boolean;
  error: ResponseError | null;
};

type DelegationNodeInfoProps = {
  validatorAddress: Types.Address;
};

export function useGetDelegationNodeCommissionChange({
  validatorAddress,
}: DelegationNodeInfoProps): DelegationNodeInfoResponse {
  const [{aptos_client: client}] = useGlobalState();

  const query = useQuery<Types.MoveValue[], ResponseError, number>({
    queryKey: ["validatorCommissionChange", client, validatorAddress],
    queryFn: () => getValidatorCommissionChange(client, validatorAddress),
    select: (res: MoveValue[]) => Number(res ? res[0] : 0) / 100, // commission rate: 22.85% is represented as 2285
  });

  return {
    isQueryLoading: query.isLoading,
    error: query.error,
    nextCommission: query.data,
  };
}
