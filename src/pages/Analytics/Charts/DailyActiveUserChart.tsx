import {Stack, Typography} from "@mui/material";
import * as React from "react";
import {DailyActiveUserData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";

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
    <Card>
      <Stack alignItems="center" marginBottom={1}>
        <Typography variant="body2" fontWeight={600}>
          Daily Active Users
        </Typography>
      </Stack>
      <BarChart labels={labels} dataset={dataset} />
    </Card>
  );
}
