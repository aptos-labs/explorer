import {APTOS_COIN} from "@aptos-labs/ts-sdk";
import {useGetCoinSupplyLimit} from "../../../api/hooks/useGetCoinSupplyLimit";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {useTranslation} from "../../../i18n";
import MetricCard from "./MetricCard";

export default function TotalSupply() {
  const {t} = useTranslation();
  const {
    isLoading,
    data: [totalSupply],
  } = useGetCoinSupplyLimit(APTOS_COIN);

  return isLoading ? (
    <MetricCard
      data={t("common.loadingEllipsis")}
      label={t("analytics.totalSupply")}
      tooltip={t("analytics.totalSupplyTip")}
    />
  ) : (
    <MetricCard
      data={
        totalSupply
          ? getFormattedBalanceStr(totalSupply.toString(), undefined, 0)
          : "-"
      }
      label={t("analytics.totalSupply")}
      tooltip={t("analytics.totalSupplyTip")}
    />
  );
}
