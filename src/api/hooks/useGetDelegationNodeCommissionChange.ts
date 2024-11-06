import {useQuery} from "@tanstack/react-query";
import {getValidatorCommissionChange} from "../v2";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {ResponseError} from "../client";
import {AccountAddressInput, MoveValue} from "@aptos-labs/ts-sdk";

type DelegationNodeInfoResponse = {
  nextCommission: number | undefined;
  isQueryLoading: boolean;
  error: ResponseError | null;
};

type DelegationNodeInfoProps = {
  validatorAddress: AccountAddressInput;
};

export function useGetDelegationNodeCommissionChange({
  validatorAddress,
}: DelegationNodeInfoProps): DelegationNodeInfoResponse {
  const [{sdk_v2_client: client}] = useGlobalState();

  const query = useQuery<MoveValue[], ResponseError, number>({
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
