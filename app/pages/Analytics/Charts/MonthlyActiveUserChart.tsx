import type {MonthlyActiveUserData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";

function getDataset(data: MonthlyActiveUserData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => dailyData.mau_signer_30);
}

type MonthlyActiveUserChartProps = {
  data: MonthlyActiveUserData[];
  days: ChartRangeDays;
};

export default function MonthlyActiveUserChart({
  data,
  days,
}: MonthlyActiveUserChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        labelKey="analytics.monthlyActiveAccounts"
        tooltipKey="analytics.monthlyActiveAccountsTip"
      />
      <LineChart labels={labels} dataset={dataset} decimals={1} />
    </CardOutline>
  );
}
