import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useGetAnalyticsData} from "../../api/hooks/useGetAnalyticsData";
import DailyActiveUserChart from "./DailyActiveUserChart";

export default function MainnetAnalytics() {
  const data = useGetAnalyticsData();

  console.log(data);

  if (!data) {
    // TODO: apply better error message
    return null;
  }

  return (
    <Box>
      <DailyActiveUserChart data={data?.daily_active_users} />
    </Box>
  );
}
