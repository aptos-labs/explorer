import {Stack, Typography} from "@mui/material";
import * as React from "react";
import {DailyPeakTPSData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";

export function getDataset(data: DailyPeakTPSData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => dailyData.max_tps_15_blocks);
}

type DailyPeakTPSChartProps = {
  data: DailyPeakTPSData[];
  days: ChartRangeDays;
};

export default function DailyPeakTPSChart({
  data,
  days,
}: DailyPeakTPSChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <Card>
      <Stack alignItems="center" marginBottom={1}>
        <Typography variant="body2" fontWeight={600}>
          Daily Peak TPS
        </Typography>
      </Stack>
      <LineChart labels={labels} dataset={dataset} />
    </Card>
  );
}
