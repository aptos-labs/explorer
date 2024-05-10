import * as React from "react";
import {DailyGasCostData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";

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
        tooltipsLabelFunc={(context: any) => {
          const priceInteger = Math.round(context.parsed.y).toString();
          const priceInAPT = getFormattedBalanceStr(priceInteger, 0);
          return `${priceInAPT} MOVE`;
        }}
      />
    </CardOutline>
  );
}
