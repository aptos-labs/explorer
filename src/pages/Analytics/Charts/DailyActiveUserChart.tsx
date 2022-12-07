import * as React from "react";
import {DailyActiveUserData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";

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
        label="Active Accounts"
        tooltip="Daily count of distinct addresses with move resource."
      />
      <BarChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
