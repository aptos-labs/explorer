import {useTranslation} from "../../../i18n";

const REWARDS_EARNED_FRACTION_DIGITS = 2;

/** `apt_rewards_distributed` is already denominated in APT (not octa). */
export function formatRewardsEarnedApt(
  amount: number,
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string,
): string {
  const normalized = Number.isFinite(amount) ? amount : 0;
  return formatNumber(normalized, {
    minimumFractionDigits: REWARDS_EARNED_FRACTION_DIGITS,
    maximumFractionDigits: REWARDS_EARNED_FRACTION_DIGITS,
  });
}

export function RewardsEarnedApt({amount}: {amount: number}) {
  const {formatNumber} = useTranslation();
  return <span>{formatRewardsEarnedApt(amount, formatNumber)} APT</span>;
}
