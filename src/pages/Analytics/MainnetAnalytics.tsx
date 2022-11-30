import {Grid} from "@mui/material";
import * as React from "react";
import {useGetAnalyticsData} from "../../api/hooks/useGetAnalyticsData";
import {ChartRangeDays} from "./Components/ChartRangeDaysSelect";
import DailyActiveUserChart from "./DailyActiveUserChart";

type MainnetAnalyticsProps = {
  days: ChartRangeDays;
};

export default function MainnetAnalytics({days}: MainnetAnalyticsProps) {
  const data = useGetAnalyticsData();

  if (!data) {
    // TODO: apply better error message
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <DailyActiveUserChart data={data?.daily_active_users} days={days} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DailyActiveUserChart data={data?.daily_active_users} days={days} />
      </Grid>
    </Grid>
  );
}
