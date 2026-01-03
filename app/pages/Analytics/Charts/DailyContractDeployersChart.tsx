import * as React from "react";
import {DailyContractDeployerData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";

function getDataset(data: DailyContractDeployerData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => dailyData.distinct_deployers);
}

type DailyContractDeployersChartProps = {
  data: DailyContractDeployerData[];
  days: ChartRangeDays;
};

export default function DailyContractDeployersChart({
  data,
  days,
}: DailyContractDeployersChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        label="Contract Deployers"
        tooltip="Daily distinct count of addresses with move modules."
      />
      <BarChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
