import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import ValidatorsPageTabs from "./Tabs";
import ValidatorsMap from "./ValidatorsMap";

export default function ValidatorsPage() {
  const [state, _] = useGlobalState();

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {state.network_name === "mainnet" && <ValidatorsMap />}
      <ValidatorsPageTabs />
    </Box>
  );
}
