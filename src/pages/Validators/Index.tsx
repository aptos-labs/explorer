import {Box, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import {ValidatorsTable as OldValidatorsTable} from "./Table";
import ValidatorsMap from "./ValidatorsMap";
import {ValidatorsTable} from "./ValidatorsTable";

export default function ValidatorsPage() {
  const [state, _] = useGlobalState();
  const [onDelegatory, setOnDelegatory] = useState<boolean>(false);
  const inDev = useGetInDevMode();

  const handleTabChange = (
    _event: React.MouseEvent<HTMLElement>,
    onDelegatory: boolean,
  ) => {
    setOnDelegatory(onDelegatory);
  };

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {state.network_name === "mainnet" ? (
        <>
          <ValidatorsMap />
          {inDev && (
            <ToggleButtonGroup
              sx={{width: 1 / 3, height: 50}}
              fullWidth={true}
              size="large"
              value={onDelegatory}
              onChange={handleTabChange}
              exclusive={true}
            >
              <ToggleButton value={false}>All Nodes</ToggleButton>
              <ToggleButton value={true}>Delegation Nodes</ToggleButton>
            </ToggleButtonGroup>
          )}
          <Box sx={{width: "auto", overflowX: "auto"}}>
            <ValidatorsTable onDelegatory={onDelegatory} />
          </Box>
        </>
      ) : (
        <>
          {inDev && (
            <ToggleButtonGroup
              sx={{width: 1 / 3, height: 50}}
              fullWidth={true}
              size="large"
              exclusive={true}
              value={onDelegatory}
              onChange={handleTabChange}
            >
              <ToggleButton value={false}>All Nodes</ToggleButton>
              <ToggleButton value={true}>Delegation Nodes</ToggleButton>
            </ToggleButtonGroup>
          )}
          <Box sx={{width: "auto", overflowX: "auto"}}>
            <OldValidatorsTable onDelegatory={onDelegatory} />
          </Box>
        </>
      )}
    </Box>
  );
}
