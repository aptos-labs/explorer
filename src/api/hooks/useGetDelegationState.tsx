import {ValidatorData} from "./useGetValidators";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {getLockedUtilSecs} from "../../pages/DelegatoryValidator/utils";
import {useGetAccountAPTBalance} from "./useGetAccountAPTBalance";
import {useGetNumberOfDelegators} from "./useGetNumberOfDelegators";
import {useGetStakingRewardsRate} from "./useGetStakingRewardsRate";
import {MoveResource} from "@aptos-labs/ts-sdk";

export type DelegationState = {
  lockedUntilSecs: bigint | null;
  balance: string | null;
  delegatorBalance: any;
  rewardsRateYearly: string | undefined;
};

export function useGetDelegationState(
  accountResource: MoveResource,
  validator: ValidatorData,
): DelegationState {
  const {account} = useWallet();
  const lockedUntilSecs = getLockedUtilSecs(accountResource);
  const balance = useGetAccountAPTBalance(account?.address!);
  const {delegatorBalance} = useGetNumberOfDelegators(validator.owner_address);
  const {rewardsRateYearly} = useGetStakingRewardsRate();

  return {
    lockedUntilSecs,
    balance: balance.data ?? null,
    delegatorBalance,
    rewardsRateYearly,
  };
}
