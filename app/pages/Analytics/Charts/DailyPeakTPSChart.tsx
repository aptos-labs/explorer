import type {DailyPeakTPSData} from "../../../api/hooks/useGetAnalyticsData";
import {CardOutline} from "../../../components/Card";
import type {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import ChartTitle from "../Components/ChartTitle";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import {useTranslation} from "../../../i18n";

export function getDataset(data: DailyPeakTPSData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => dailyData.max_tps_15_blocks);
}

type DailyPeakTPSChartProps = {
  data: DailyPeakTPSData[];
  days: ChartRangeDays;
};

export default function DailyPeakTPSChart({
  data,
  days,
}: DailyPeakTPSChartProps) {
  const {locale} = useTranslation();
  const labels = getLabels(data, days, locale);
  const dataset = getDataset(data, days);

  return (
    <CardOutline>
      <ChartTitle
        labelKey="analytics.peakTps"
        tooltipKey="analytics.peakTpsTip"
      />
      <LineChart labels={labels} dataset={dataset} />
    </CardOutline>
  );
}
