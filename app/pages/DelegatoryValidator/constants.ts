/* validator page -> my deposits section -> status column -> tooltip content & color scheme */

import {getStakingStatusColors} from "../../themes/colors/aptosBrandColors";

// step 1 STAKED
const stakedColorsLight = getStakingStatusColors("light").staked;
const stakedColorsDark = getStakingStatusColors("dark").staked;
export const STAKED_TEXT_COLOR_LIGHT = stakedColorsLight.text;
export const STAKED_TEXT_COLOR_DARK = stakedColorsDark.text;
export const STAKED_BACKGROUND_COLOR_LIGHT = stakedColorsLight.background;
export const STAKED_BACKGROUND_COLOR_DARK = stakedColorsDark.background;
export const STAKED_LABEL = "Staked";
export const STAKED_DESCRIPTION = `You are getting rewards for the staked deposit, not able to
withdraw it until the lock period ends. But you can initiate this process with an
unstake option.`;

// step 2 WITHDRAW PENDING
const withdrawPendingColorsLight =
  getStakingStatusColors("light").withdrawPending;
const withdrawPendingColorsDark =
  getStakingStatusColors("dark").withdrawPending;
export const WITHDRAW_PENDING_TEXT_COLOR_LIGHT =
  withdrawPendingColorsLight.text;
export const WITHDRAW_PENDING_TEXT_COLOR_DARK = withdrawPendingColorsDark.text;
export const WITHDRAW_PENDING_BACKGROUND_COLOR_LIGHT =
  withdrawPendingColorsLight.background;
export const WITHDRAW_PENDING_BACKGROUND_COLOR_DARK =
  withdrawPendingColorsDark.background;
export const WITHDRAW_PENDING_LABEL = "Withdraw pending";
export const WITHDRAW_PENDING_DESCRIPTION =
  "If you decided to unstake your deposit, it will be locked till the end of the lock period. Your deposit is still earning rewards.";

// step 3 WITHDRAW READY
const withdrawReadyColorsLight = getStakingStatusColors("light").withdrawReady;
const withdrawReadyColorsDark = getStakingStatusColors("dark").withdrawReady;
export const WITHDRAW_READY_TEXT_COLOR_LIGHT = withdrawReadyColorsLight.text;
export const WITHDRAW_READY_TEXT_COLOR_DARK = withdrawReadyColorsDark.text;
export const WITHDRAW_READY_BACKGROUND_COLOR_LIGHT =
  withdrawReadyColorsLight.background;
export const WITHDRAW_READY_BACKGROUND_COLOR_DARK =
  withdrawReadyColorsDark.background;
export const WITHDRAW_READY_LABEL = "Withdraw ready";
export const WITHDRAW_READY_DESCRIPTION =
  "After the end of the lock period you will be able to withdraw your funds to your wallet.";

/**
 * In theory, minimum is 10 APT, but this 10 APT doesn't include the initial add_stake fee.
 * Without confusing delegators with decimals, we set limit to be 11 for staking.
 * For unlock and reactivate, we set it to 11 as well to mitigate the rounding error where
 * 1.0000000 is rounded to 0.9999999
 */
export const MINIMUM_APT_IN_POOL_FOR_EXPLORER = 11;
export const MINIMUM_APT_IN_POOL = 10;
