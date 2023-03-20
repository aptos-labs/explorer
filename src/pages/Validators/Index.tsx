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
  const viewCount = config.getValue("view_count");

  useEffect(() => {
    if (viewCount && Number(viewCount) > 0) {
      Statsig.overrideConfig(STAKING_BANNER_CONFIG_NAME, {
        viewCount: Number(viewCount) - 1,
      });
    }
  }, []);

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {viewCount && Number(viewCount) > 0 ? <StakingBanner /> : null}
      {state.network_name === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
