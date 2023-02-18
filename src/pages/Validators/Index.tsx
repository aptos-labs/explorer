import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import StyledTab from "../../components/StyledTab";
import StyledTabs from "../../components/StyledTabs";
import {Network} from "../../constants";
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

  const validatorsTable =
    state.network_name === Network.MAINNET ||
    state.network_name === Network.TESTNET ? (
      <ValidatorsTable onDelegatory={onDelegatory} />
    ) : (
      <OldValidatorsTable onDelegatory={onDelegatory} />
    );

  const validatorsTabs = (
    <StyledTabs value={onDelegatory} onChange={handleTabChange}>
      <StyledTab
        value={false}
        label={
          <Typography sx={{textTransform: "capitalize"}}>All Nodes</Typography>
        }
        isFirst={true}
        isLast={false}
      />
      <StyledTab
        value={true}
        label={
          <Typography sx={{textTransform: "capitalize"}}>
            Delegation Nodes
          </Typography>
        }
        isFirst={false}
        isLast={true}
      />
    </StyledTabs>
  );

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validators
      </Typography>
      {state.network_name === "mainnet" && <ValidatorsMap />}
      {inDev && state.network_name === Network.TESTNET && validatorsTabs}
      <Box sx={{width: "auto", overflowX: "auto"}}>{validatorsTable}</Box>
    </Box>
  );
}
