import {Stack, Typography} from "@mui/material";
import * as React from "react";
import {DailyAvgGasData} from "../../../api/hooks/useGetAnalyticsData";
import LineChart from "../Components/LineChart";
import {getLabels} from "../utils";
import Card from "../../LandingPage/NetworkInfo/Card";
import {ChartRangeDays} from "../Components/ChartRangeDaysSelect";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";

export function getDataset(data: DailyAvgGasData[], days: number): number[] {
  return data.slice(-days).map((dailyData) => {
    const price_integer = dailyData.avg_gas_unit_price.split(".")[0];
    const aa = getFormattedBalanceStr(price_integer, 8);
    return Number(aa);
  });
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
      <Stack alignItems="center" marginBottom={1}>
        <Typography variant="body2" fontWeight={600}>
          Daily Average Gas Unit Price
        </Typography>
      </Stack>
      <LineChart
        labels={labels}
        dataset={dataset}
        tooltipsLabelFunc={(context: any) => `${context.parsed.y} APT`}
        yAxisLabelFunc={(value: any) => `${value} APT`}
      />
    </Card>
  );
}
