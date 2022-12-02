import * as React from "react";
import {DailyAvgGasData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import ChartTitle from "../Components/ChartTitle";

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
    <Card>
      <ChartTitle
        label="Daily Average Gas Unit Price"
        tooltip="Daily Average Gas Unit Price"
      />
      <LineChart
        labels={labels}
        dataset={dataset}
        fill
        tooltipsLabelFunc={(context: any) => {
          const priceInteger = Math.round(context.parsed.y).toString();
          const priceInAPT = getFormattedBalanceStr(priceInteger, 8);
          return `${priceInAPT} APT`;
        }}
      />
    </Card>
  );
}
