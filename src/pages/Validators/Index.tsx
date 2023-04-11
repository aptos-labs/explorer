import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useEffect} from "react";
import {Statsig, useConfig} from "statsig-react";
import {STAKING_BANNER_CONFIG_NAME} from "../../dataConstants";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import {StakingBanner} from "./StakingBanner";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";

export default function ValidatorsPage() {
  const [state, _] = useGlobalState();
  const {config} = useConfig(STAKING_BANNER_CONFIG_NAME);
  const viewCountCap = config.getValue("viewCount");
  // Get the user's stable ID
  const stableID = Statsig.getStableID();

  // Create a key for storing the view count and last visit timestamp in localStorage
  const viewCountKey = `${stableID}_view_count`;
  const lastVisitKey = `${stableID}_last_visit`;

  // Get the current view count and last visit timestamp from localStorage
  const currentViewCount = localStorage.getItem(viewCountKey);
  const lastVisitTimestamp = localStorage.getItem(lastVisitKey);

  useEffect(() => {
    if (viewCountCap && Number(currentViewCount) <= Number(viewCountCap)) {
      // Get the current timestamp
      const currentTimestamp = Date.now();

      // Check if the last visit timestamp is null or if it's been more than 1 hour since the last visit
      if (
        !lastVisitTimestamp ||
        currentTimestamp - Number(lastVisitTimestamp) > 3600000 // 1 hour
      ) {
        // Increment the view count and store the current timestamp in localStorage
        localStorage.setItem(
          viewCountKey,
          currentViewCount ? `${Number(currentViewCount) + 1}` : "1",
        );
        localStorage.setItem(lastVisitKey, String(currentTimestamp));
      }
    }
  }, []);

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {currentViewCount && Number(currentViewCount) <= 5 ? (
        <StakingBanner />
      ) : null}
      {state.network_name === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
