import type {DailyContractData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import BarChart from "../Components/BarChart";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {getLabels} from "../utils";
import {useTranslation} from "../../../i18n";

function getDataset(data: DailyContractData[], days: number): number[] {
  return data
    .slice(-days)
    .map((dailyData) => dailyData.daily_contract_deployed);
}

type DailyDeployedContractsChartProps = {
  data: DailyContractData[];
  days: ChartRangeDays;
};

export default function DailyDeployedContractsChart({
  data,
  days,
}: DailyDeployedContractsChartProps) {
  const {locale} = useTranslation();
  const labels = getLabels(data, days, locale);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        labelKey="analytics.deployedContracts"
        tooltipKey="analytics.deployedContractsTip"
      />
      <BarChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
