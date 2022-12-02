import * as React from "react";
import {DailyContractData} from "../../../api/hooks/useGetAnalyticsData";
import BarChart from "../Components/BarChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";

function getDataset(data: DailyContractData[], days: number): number[] {
  return data
    .slice(-days)
    .map((dailyData) => dailyData.daily_contract_deployed);
}

type DailyDeployedContractsChartProps = {
  data: DailyContractData[];
  days: ChartRangeDays;
};

export default function DailyDeployedContractsChart({
  data,
  days,
}: DailyDeployedContractsChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <Card>
      <ChartTitle
        label="Daily Deployed Contracts"
        tooltip="Daily Deployed Contracts"
      />
      <BarChart labels={labels} dataset={dataset} />
    </Card>
  );
}
