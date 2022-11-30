import {Stack, Typography} from "@mui/material";
import * as React from "react";
import {DailyNewAccountData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";

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
    <Card>
      <Stack alignItems="center" marginBottom={1}>
        <Typography variant="body2" fontWeight={600}>
          Daily New Accounts Created
        </Typography>
      </Stack>
      <BarChart labels={labels} dataset={dataset} />
    </Card>
  );
}
