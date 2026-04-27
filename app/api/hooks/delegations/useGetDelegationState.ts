import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useGetNumberOfDelegators} from "~/api/hooks";
import {useGetAccountAPTBalance} from "~/api/hooks/useGetAccountAPTBalance";
import {useGetStakingRewardsRate} from "~/api/hooks/useGetStakingRewardsRate";
import type {ValidatorData} from "~/api/hooks/useGetValidators";
import {getLockedUtilSecs} from "~/pages/DelegatoryValidator/utils.tsx";
import type {Types} from "~/types/aptos";
import {addressFromWallet} from "~/utils";

export type DelegationState = {
  lockedUntilSecs: bigint | null;
  balance: string | null;
  delegatorBalance: number;
  rewardsRateYearly: string | undefined;
};

export function useGetDelegationState(
  accountResource: Types.MoveResource,
  validator: ValidatorData,
): DelegationState {
  const {account} = useWallet();
  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  // FIXME Handle the case where the account is not connected
  const balance = useGetAccountAPTBalance(addressFromWallet(account?.address));
  const {numberOfDelegators} = useGetNumberOfDelegators(
    validator.owner_address,
  );
  const {rewardsRateYearly} = useGetStakingRewardsRate();

  return {
    lockedUntilSecs,
    balance: balance.data ?? null,
    delegatorBalance: numberOfDelegators,
    rewardsRateYearly,
  };
}
