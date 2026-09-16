import type {TooltipItem} from "chart.js";
import type {DailyBlockGapData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import {useTranslation} from "../../../i18n";

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
  const {locale, t, formatNumber} = useTranslation();
  const labels = getLabels(data, days, locale);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        labelKey="analytics.medianBlockTime"
        tooltipKey="analytics.medianBlockTimeTip"
      />
      <LineChart
        labels={labels}
        dataset={dataset}
        decimals={1}
        tooltipsLabelFunc={(context: TooltipItem<"line">) => {
          const yValue = context.parsed.y;
          if (yValue === null || yValue === undefined) {
            return t("common.na");
          }
          return `${formatNumber(yValue, {maximumFractionDigits: 1})} ms`;
        }}
      />
    </CardOutline>
  );
}
