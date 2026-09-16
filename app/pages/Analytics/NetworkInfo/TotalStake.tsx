import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {useTranslation} from "../../../i18n";
import MetricCard from "./MetricCard";

export default function TotalStake() {
  const {t, locale} = useTranslation();
  const {totalVotingPower} = useGetValidatorSet();

  return (
    <MetricCard
      data={
        totalVotingPower
          ? getFormattedBalanceStr(
              totalVotingPower.toString(),
              undefined,
              0,
              locale,
            )
          : "-"
      }
      label={t("analytics.activelyStaked")}
      tooltip={t("analytics.activelyStakedTip")}
    />
  );
}
