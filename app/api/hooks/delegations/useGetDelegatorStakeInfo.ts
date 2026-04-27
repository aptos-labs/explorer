import {useQuery} from "@tanstack/react-query";
import {getStake} from "~/api";
import {useAptosClient, useNetworkValue} from "~/global-config";
import type {Types} from "~/types/aptos";

export function useGetDelegatorStakeInfo(
  delegatorAddress: Types.Address,
  validatorAddress: Types.Address,
) {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  // Validate addresses
  const isValidDelegator = !!delegatorAddress && delegatorAddress.length > 0;
  const isValidValidator = !!validatorAddress && validatorAddress.length > 0;
  const areAddressesValid = isValidDelegator && isValidValidator;

  const {data, isLoading, error} = useQuery({
    queryKey: [
      "delegatorStakeInfo",
      networkValue,
      delegatorAddress,
      validatorAddress,
    ],
    queryFn: () => getStake(aptosClient, delegatorAddress, validatorAddress),
    enabled:
      !!delegatorAddress &&
      !!validatorAddress &&
      !!aptosClient &&
      areAddressesValid,
  });

  // Return the same structure as before for backward compatibility
  return {
    stakes: data || [],
    isLoading,
    error,
  };
}
