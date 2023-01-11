import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import {ValidatorsTable as OldValidatorsTable} from "./Table";
import ValidatorsMap from "./ValidatorsMap";
import {ValidatorsTable} from "./ValidatorsTable";

export default function ValidatorsPage() {
  const [state, _] = useGlobalState();

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {state.network_name === "mainnet" ? (
        <>
          <ValidatorsMap />
          <Box sx={{width: "auto", overflowX: "auto"}}>
            <ValidatorsTable />
          </Box>
        </>
      ) : (
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <OldValidatorsTable />
        </Box>
      )}
    </Box>
  );
}
