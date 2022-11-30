import {Grid} from "@mui/material";
import * as React from "react";
import {useGetAnalyticsData} from "../../api/hooks/useGetAnalyticsData";
import {ChartRangeDays} from "./Components/ChartRangeDaysSelect";
import DailyActiveUserChart from "./Charts/DailyActiveUserChart";
import DailyAvgGasUnitPriceChart from "./Charts/DailyAvgGasUnitPriceChart";
import DailyDeployedContractsChart from "./Charts/DailyDeployedContractsChart";
import DailyPeakTPSChart from "./Charts/DailyPeakTPSChart";
import DailyNewAccountsCreatedChart from "./Charts/DailyNewAccountsCreatedChart";
import DailyUserTransactionsChart from "./Charts/DailyUserTransactionsChart";

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
        <DailyActiveUserChart data={data.daily_active_users} days={days} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DailyUserTransactionsChart
          data={data.daily_user_transactions}
          days={days}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DailyPeakTPSChart data={data.daily_max_tps_15_blocks} days={days} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DailyNewAccountsCreatedChart
          data={data.daily_new_accounts_created}
          days={days}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DailyDeployedContractsChart
          data={data.daily_deployed_contracts}
          days={days}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DailyAvgGasUnitPriceChart
          data={data.daily_average_gas_unit_price}
          days={days}
        />
      </Grid>
    </Grid>
  );
}
