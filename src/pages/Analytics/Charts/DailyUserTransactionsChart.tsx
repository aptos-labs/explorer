import {Stack, Typography} from "@mui/material";
import * as React from "react";
import {DailyUserTxnData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";

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
      <Stack alignItems="center" marginBottom={1}>
        <Typography variant="body2" fontWeight={600}>
          Daily User Transactions
        </Typography>
      </Stack>
      <BarChart labels={labels} dataset={dataset} />
    </Card>
  );
}
