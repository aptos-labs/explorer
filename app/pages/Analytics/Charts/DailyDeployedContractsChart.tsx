import type {DailyContractData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import BarChart from "../Components/BarChart";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import {getLabels} from "../utils";

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
    <CardOutline>
      <ChartTitle
        label="Deployed Contracts"
        tooltip="Daily count of move modules."
      />
      <BarChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
