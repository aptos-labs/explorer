import {Box, Tab, Tabs, Typography} from "@mui/material";
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
    _event: React.SyntheticEvent,
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
           <Tabs value={onDelegatory} onChange={handleTabChange}>
              <Tab label="All Nodes" value={false} />
              <Tab label="Delegation Nodes" value={true} />
            </Tabs>
          )
            <Tabs value={onDelegatory} onChange={handleTabChange}>
              <Tab label="All Nodes" value={false} />
              <Tab label="Delegation Nodes" value={true} />
            </Tabs>
          ) : null}
          <Box sx={{width: "auto", overflowX: "auto"}}>
            <ValidatorsTable onDelegatory={onDelegatory} />
          </Box>
        </>
      ) : (
        <>
          {inDev ? (
            <Tabs value={onDelegatory} onChange={handleTabChange}>
              <Tab label="All Nodes" value={false} />
              <Tab label="Delegation Nodes" value={true} />
            </Tabs>
          ) : null}
          <Box sx={{width: "auto", overflowX: "auto"}}>
            <OldValidatorsTable onDelegatory={onDelegatory} />
          </Box>
        </>
      )}
    </Box>
  );
}
