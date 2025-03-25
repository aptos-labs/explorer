import * as React from "react";
import {DailyPeakTPSData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";

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
    <CardOutline>
      <ChartTitle
        label="Max TPS"
        tooltip="Daily highest rate of transactions per second."
      />
      <LineChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
