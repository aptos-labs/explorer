import type {DailyUserTxnData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";

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
