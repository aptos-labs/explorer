import * as React from "react";
import {MonthlyActiveUserData} from "../../../api/hooks/useGetAnalyticsData";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";
import LineChart from "../Components/LineChart";

function getDataset(data: MonthlyActiveUserData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => dailyData.mau_signer_28);
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
        label="Monthly Active Accounts"
        tooltip="Daily count of distinct addresses with signed transactions over the last 28 days."
      />
      <LineChart labels={labels} dataset={dataset} decimals={1} />
    </CardOutline>
  );
}
