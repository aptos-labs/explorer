import {Box, Typography} from "@mui/material";
import * as React from "react";
import {defaultNetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import MainnetAnalytics from "./MainnetAnalytics";

export default function AnalyticsPage() {
  const [state, _] = useGlobalState();

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Analytics
      </Typography>
      {state.network_name === defaultNetworkName ? (
        <MainnetAnalytics />
      ) : (
        <Typography>Analytics are available for Mainnet only.</Typography>
      )}
    </Box>
  );
}
