import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import {ValidatorsTable as OldValidatorsTable} from "./Table";
import ValidatorsMap from "./ValidatorsMap";
import {ValidatorsTable} from "./ValidatorsTable";

export default function ValidatorsPage() {
  const inDevMode = useGetInDevMode();
  const [state, _] = useGlobalState();

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {inDevMode && state.network_name === "mainnet" ? (
        <>
          <ValidatorsMap />
          <ValidatorsTable />
        </>
      ) : (
        <OldValidatorsTable />
      )}
    </Box>
  );
}
