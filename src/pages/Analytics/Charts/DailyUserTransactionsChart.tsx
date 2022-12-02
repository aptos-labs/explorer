import * as React from "react";
import {DailyUserTxnData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";

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
    <Card>
      <ChartTitle
        label="Daily User Transactions"
        tooltip="Daily User Transactions"
      />
      <BarChart labels={labels} dataset={dataset} />
    </Card>
  );
}
