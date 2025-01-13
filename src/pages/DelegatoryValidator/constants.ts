/* validator page -> my deposits section -> status column -> tooltip content & color scheme */

// step 1 STAKED
export const STAKED_TEXT_COLOR_LIGHT = "rgba(14, 165, 233, 1)";
export const STAKED_TEXT_COLOR_DARK = "rgba(125, 211, 252, 1)";
export const STAKED_BACKGROUND_COLOR_LIGHT = "rgba(14, 165, 233, 0.1)";
export const STAKED_BACKGROUND_COLOR_DARK = "rgba(125, 211, 252, 0.1)";
export const STAKED_LABEL = "Staked";
export const STAKED_DESCRIPTION = `You are getting rewards for the staked deposit, not able to
withdraw it until the lock period ends. But you can initiate this process with an
unstake option.`;

// step 2 WITHDRAW PENDING
export const WITHDRAW_PENDING_TEXT_COLOR_LIGHT = "rgba(202, 138, 4, 1)";
export const WITHDRAW_PENDING_TEXT_COLOR_DARK = "rgba(234, 179, 8, 1)";
export const WITHDRAW_PENDING_BACKGROUND_COLOR_LIGHT =
  "rgba(250, 204, 21, 0.2)";
export const WITHDRAW_PENDING_BACKGROUND_COLOR_DARK = "rgba(252, 211, 77, 0.1)";
export const WITHDRAW_PENDING_LABEL = "Withdraw pending";
export const WITHDRAW_PENDING_DESCRIPTION =
  "If you decided to unstake your deposit, it will be locked till the end of the lock period. Your deposit is still earning rewards.";

// step 3 WITHDRAW READY
export const WITHDRAW_READY_TEXT_COLOR_LIGHT = "rgba(15, 118, 110, 1)";
export const WITHDRAW_READY_TEXT_COLOR_DARK = "rgba(20, 184, 166, 1)";
export const WITHDRAW_READY_BACKGROUND_COLOR_LIGHT = "rgba(20, 184, 166, 0.1)";
export const WITHDRAW_READY_BACKGROUND_COLOR_DARK = "rgba(20, 184, 166, 0.1)";
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
