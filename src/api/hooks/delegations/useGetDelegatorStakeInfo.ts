import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {getStake} from "../..";
import {useGlobalState} from "../../../global-config/GlobalConfig";

export function useGetDelegatorStakeInfo(
  delegatorAddress: Types.Address,
  validatorAddress: Types.Address,
) {
  const [state] = useGlobalState();

  // Validate addresses
  const isValidDelegator = !!delegatorAddress && delegatorAddress.length > 0;
  const isValidValidator = !!validatorAddress && validatorAddress.length > 0;
  const areAddressesValid = isValidDelegator && isValidValidator;

  const {data, isLoading, error} = useQuery({
    queryKey: [
      "delegatorStakeInfo",
      state.network_value,
      delegatorAddress,
      validatorAddress,
    ],
    queryFn: () =>
      getStake(state.aptos_client, delegatorAddress, validatorAddress),
    enabled:
      !!delegatorAddress &&
      !!validatorAddress &&
      !!state.aptos_client &&
      areAddressesValid,
  });

  // Return the same structure as before for backward compatibility
  return {
    stakes: data || [],
    isLoading,
    error,
  };
}
