import * as React from "react";
import {Box} from "@mui/material";
import {DelegationValidatorsTable} from "./DelegationValidatorsTable";

export default function ValidatorsPageTabs(): React.JSX.Element {
  return (
    <Box sx={{width: "100%"}}>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <DelegationValidatorsTable />
      </Box>
    </Box>
  );
}
