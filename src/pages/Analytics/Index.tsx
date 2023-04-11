import {Box, Typography} from "@mui/material";
import * as React from "react";
import {defaultNetworkName} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import MainnetAnalytics from "./MainnetAnalytics";

export default function AnalyticsPage() {
  const [state, _] = useGlobalState();

  const titleComponent = (
    <Typography variant="h3" marginBottom={2}>
      Network Analytics
    </Typography>
  );

  return (
    <Box>
      <PageHeader />
      {state.network_name === defaultNetworkName ? (
        <>
          {titleComponent}
          <MainnetAnalytics />
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
