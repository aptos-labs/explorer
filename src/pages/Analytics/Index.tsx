import {Box, Typography} from "@mui/material";
import * as React from "react";
import {defaultNetworkName} from "../../constants";
import {useNetworkName} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import MainnetAnalytics from "./MainnetAnalytics";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

export default function AnalyticsPage() {
  const networkName = useNetworkName();

  usePageMetadata({title: "Network Analytics"});
  const titleComponent = (
    <Typography variant="h3" marginBottom={2}>
      Network Analytics
    </Typography>
  );

  return (
    <Box>
      <PageHeader />
      {networkName === defaultNetworkName ? (
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
