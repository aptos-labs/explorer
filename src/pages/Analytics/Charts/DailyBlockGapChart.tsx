import * as React from "react";
import {DailyBlockGapData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";
import {TooltipItem} from "chart.js";

export function getDataset(data: DailyBlockGapData[], days: number): number[] {
  return data
    .slice(-days)
    .map((dailyData) => Number(dailyData.block_time_diff_nanos) / 1000000); // Convert nanos to milliseconds
}

type DailyBlockGapChartProps = {
  data: DailyBlockGapData[];
  days: ChartRangeDays;
};

export default function DailyBlockGapChart({
  data,
  days,
}: DailyBlockGapChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        label="Median Block Time"
        tooltip="P50 block time (gap between blocks) in milliseconds over 1 day. Changes based on network latency between validators and blockchain congestion (more txn per block vs faster blocks)."
      />
      <LineChart
        labels={labels}
        dataset={dataset}
        tooltipsLabelFunc={(context: TooltipItem<"line">) => {
          const yValue = context.parsed.y;
          if (yValue === null || yValue === undefined) {
            return "N/A";
          }
          const milliseconds = Math.round(yValue);
          return `${milliseconds} ms`;
        }}
      />
    </CardOutline>
  );
}
