import {Box, Typography} from "@mui/material";
import * as React from "react";
import {defaultNetworkName} from "../../constants";
import {useNetworkName} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import MainnetAnalytics from "./MainnetAnalytics";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

export default function AnalyticsPage() {
  const networkName = useNetworkName();

  const titleComponent = (
    <Typography variant="h3" marginBottom={2}>
      Network Analytics
    </Typography>
  );

  return (
    <Box>
      <PageMetadata
        title="Network Analytics"
        description="View Aptos network analytics including daily active users, transaction volumes, TPS, gas fees, staking stats, and blockchain metrics. Interactive charts and real-time data."
        type="website"
        keywords={[
          "analytics",
          "metrics",
          "TPS",
          "daily active users",
          "transaction volume",
          "gas fees",
          "blockchain statistics",
        ]}
        canonicalPath="/analytics"
      />
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
