import type {TooltipItem} from "chart.js";
import type {DailyGasCostData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";

export function getDataset(data: DailyGasCostData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => Number(dailyData.gas_cost));
}

type DailyGasConsumptionChartProps = {
  data: DailyGasCostData[];
  days: ChartRangeDays;
};

export default function DailyGasConsumptionChart({
  data,
  days,
}: DailyGasConsumptionChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);
  return (
    <CardOutline>
      <ChartTitle
        label="Gas Consumption"
        tooltip="Daily gas on user transactions."
      />
      <LineChart
        labels={labels}
        dataset={dataset}
        fill
        tooltipsLabelFunc={(context: TooltipItem<"line">) => {
          const yValue = context.parsed.y;
          if (yValue === null || yValue === undefined) {
            return "N/A";
          }
          const priceInteger = Math.round(yValue).toString();
          const priceInAPT = getFormattedBalanceStr(priceInteger, 0);
          return `${priceInAPT} APT`;
        }}
      />
    </CardOutline>
  );
}
