import type {TooltipItem} from "chart.js";
import type {DailyAvgGasData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import {englishT} from "../../../i18n";

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
        labelKey="analytics.avgGasUnitPrice"
        tooltipKey="analytics.avgGasUnitPriceTip"
      />
      <LineChart
        labels={labels}
        dataset={dataset}
        fill
        tooltipsLabelFunc={(context: TooltipItem<"line">) => {
          const yValue = context.parsed.y;
          if (yValue === null || yValue === undefined) {
            return englishT("common.na");
          }
          const priceInteger = Math.round(yValue).toString();
          const priceInAPT = getFormattedBalanceStr(priceInteger, 8);
          return `${priceInAPT} APT`;
        }}
      />
    </CardOutline>
  );
}
