import {Box} from "@mui/material";
import * as React from "react";
import {DailyActiveUserData} from "../../api/hooks/useGetAnalyticsData";

type DailyActiveUserChartProps = {
  data: DailyActiveUserData[];
};

export default function DailyActiveUserChart({
  data,
}: DailyActiveUserChartProps) {
  return <Box>{data[0].daily_active_user_count}</Box>;
}
