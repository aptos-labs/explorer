import * as React from "react";
import {DailyPeakTPSData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";

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
      <ChartTitle label="Daily Peak TPS" tooltip="Daily Peak TPS" />
      <LineChart labels={labels} dataset={dataset} />
    </Card>
  );
}
