import {useTranslation} from "../../../i18n";

export function RewardsEarnedValue({amount}: {amount: number}) {
  const {formatNumber} = useTranslation();

  // Validator stats report rewards in APT, not integer octas.
  return (
    <span>
      {formatNumber(Number(amount) || 0, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}{" "}
      APT
    </span>
  );
}
