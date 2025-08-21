import * as React from "react";
import {DailyNewAccountData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";

function getDataset(data: DailyNewAccountData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => dailyData.new_account_count);
}

type DailyNewAccountsCreatedChartProps = {
  data: DailyNewAccountData[];
  days: ChartRangeDays;
};

export default function DailyNewAccountsCreatedChart({
  data,
  days,
}: DailyNewAccountsCreatedChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        label="New Accounts Created"
        tooltip="Daily instances of distinct addresses signing transactions for the first time."
      />
      <BarChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
