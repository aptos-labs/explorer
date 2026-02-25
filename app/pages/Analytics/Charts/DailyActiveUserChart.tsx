import type {DailyActiveUserData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import BarChart from "../Components/BarChart";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {getLabels} from "../utils";

function getDataset(data: DailyActiveUserData[], days: number): number[] {
  return data
    .slice(-days)
    .map((dailyData) => dailyData.daily_active_user_count);
}

type DailyActiveUserChartProps = {
  data: DailyActiveUserData[];
  days: ChartRangeDays;
};

export default function DailyActiveUserChart({
  data,
  days,
}: DailyActiveUserChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        label="Daily Active Accounts"
        tooltip="Daily count of distinct addresses with signed transactions."
      />
      <BarChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
