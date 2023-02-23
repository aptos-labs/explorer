import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import StyledTab from "../../components/StyledTab";
import StyledTabs from "../../components/StyledTabs";
import {Network} from "../../constants";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import {DelegationValidatorsTable} from "./DelegationValidatorsTable";
import {ValidatorsTable as OldValidatorsTable} from "./Table";
import ValidatorsMap from "./ValidatorsMap";
import {ValidatorsTable} from "./ValidatorsTable";

enum VALIDATORS_TAB_VALUE {
  ALL_NODES = "all_nodes",
  DELEGATION_NODES = "delegation_nodes",
}

const VALIDATORS_TAB_VALUES: VALIDATORS_TAB_VALUE[] = [
  VALIDATORS_TAB_VALUE.ALL_NODES,
  VALIDATORS_TAB_VALUE.DELEGATION_NODES,
];

export default function ValidatorsPage() {
  const [state, _] = useGlobalState();
  const inDev = useGetInDevMode();
  const {tab} = useParams();
  const navigate = useNavigate();
  const value =
    tab === undefined
      ? VALIDATORS_TAB_VALUES[0]
      : (tab as VALIDATORS_TAB_VALUE);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: VALIDATORS_TAB_VALUE,
  ) => {
    navigate(`/validators/${newValue}`);
  };

  function getValidatorsTable() {
    switch (state.network_name) {
      case Network.MAINNET:
        return <ValidatorsTable />;
      case Network.TESTNET:
        return tab === VALIDATORS_TAB_VALUE.DELEGATION_NODES ? (
          <DelegationValidatorsTable />
        ) : (
          <ValidatorsTable />
        );
      case Network.DEVNET:
        return (
          <OldValidatorsTable
            onDelegatory={tab === VALIDATORS_TAB_VALUE.DELEGATION_NODES}
          />
        );
    }
  }

  const validatorsTabs = (
    <StyledTabs value={value} onChange={handleChange}>
      <StyledTab
        value={VALIDATORS_TAB_VALUE.ALL_NODES}
        label={
          <Typography sx={{textTransform: "capitalize"}}>All Nodes</Typography>
        }
        isFirst={true}
        isLast={false}
      />
      <StyledTab
        value={VALIDATORS_TAB_VALUE.DELEGATION_NODES}
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
      <Box sx={{width: "auto", overflowX: "auto"}}>{getValidatorsTable()}</Box>
    </Box>
  );
}
