import * as React from "react";
import {DailyAvgGasData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import ChartTitle from "../Components/ChartTitle";
import {CardOutline} from "../../../components/Card";

export function getDataset(data: DailyAvgGasData[], days: number): number[] {
  return data
    .slice(-days)
    .map((dailyData) => Number(dailyData.avg_gas_unit_price));
}

type DailyAvgGasUnitPriceChartProps = {
  data: DailyAvgGasData[];
  days: ChartRangeDays;
};

export default function DailyAvgGasUnitPriceChart({
  data,
  days,
}: DailyAvgGasUnitPriceChartProps) {
  const labels = getLabels(data, days);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        label="Average Gas Unit Price"
        tooltip="Daily average gas unit price on user transactions."
      />
      <LineChart
        labels={labels}
        dataset={dataset}
        fill
        tooltipsLabelFunc={(context: any) => {
          const priceInteger = Math.round(context.parsed.y).toString();
          const priceInAPT = getFormattedBalanceStr(priceInteger, 8);
          return `${priceInAPT} MVMT`;
        }}
      />
    </CardOutline>
  );
}
