import {Box, Typography} from "@mui/material";
import {Stack} from "@mui/system";
import * as React from "react";
import {useState} from "react";
import {defaultNetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import ChartRangeDaysSelect, {
  ChartRangeDays,
} from "./Components/ChartRangeDaysSelect";
import MainnetAnalytics from "./MainnetAnalytics";

export default function AnalyticsPage() {
  const [state, _] = useGlobalState();
  const [days, setDays] = useState<ChartRangeDays>(
    ChartRangeDays.DEFAULT_RANGE,
  );

  const titleComponent = (
    <Typography variant="h3" marginBottom={2}>
      Analytics
    </Typography>
  );

  return (
    <Box>
      <PageHeader />
      {state.network_name === defaultNetworkName ? (
        <>
          <Stack
            direction={{sx: "column", sm: "row"}}
            alignItems={{sx: "flex-start", sm: "center"}}
            justifyContent="space-between"
            marginBottom={3}
          >
            {titleComponent}
            <ChartRangeDaysSelect days={days} setDays={setDays} />
          </Stack>
          <MainnetAnalytics days={days} />
        </>
      ) : (
        <>
          {titleComponent}
          <Typography>Analytics are available for Mainnet only.</Typography>
        </>
      )}
    </Box>
  );
}
