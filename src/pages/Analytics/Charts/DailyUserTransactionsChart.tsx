import * as React from "react";
import {DailyUserTxnData} from "../../../api/hooks/useGetAnalyticsData";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";
import LineChart from "../Components/LineChart";

function getDataset(data: DailyUserTxnData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => dailyData.num_user_transactions);
}

type DailyUserTransactionsChartProps = {
  data: DailyUserTxnData[];
  days: ChartRangeDays;
};

export default function DailyUserTransactionsChart({
  data,
  days,
}: DailyUserTransactionsChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        label="User Transactions"
        tooltip="Daily transaction count of user transactions."
      />
      <LineChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
