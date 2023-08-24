import * as React from "react";
import {Box, Typography} from "@mui/material";
import {assertNever} from "../../utils";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import {useParams} from "react-router-dom";
import {ValidatorsTable} from "./ValidatorsTable";
import {DelegationValidatorsTable} from "./DelegationValidatorsTable";
import {Network, NetworkName} from "../../constants";
import {ValidatorsTable as OldValidatorsTable} from "./Table";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {Statsig} from "statsig-react";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useNavigate} from "../../routing";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";

enum VALIDATORS_TAB_VALUE {
  ALL_NODES = "all",
  DELEGATION_NODES = "delegation",
}
const VALIDATORS_TAB_VALUES: VALIDATORS_TAB_VALUE[] = [
  VALIDATORS_TAB_VALUE.ALL_NODES,
  VALIDATORS_TAB_VALUE.DELEGATION_NODES,
];

function getTabLabel(value: VALIDATORS_TAB_VALUE): string {
  switch (value) {
    case VALIDATORS_TAB_VALUE.ALL_NODES:
      return "ALL NODES";
    case VALIDATORS_TAB_VALUE.DELEGATION_NODES:
      return "DELEGATION NODES";
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: VALIDATORS_TAB_VALUE;
  networkName: NetworkName;
};

function TabPanel({value, networkName}: TabPanelProps): JSX.Element {
  switch (networkName) {
    case Network.PREVIEWNET:
      return <ValidatorsTable />;
    case Network.MAINNET:
    case Network.TESTNET:
      return value === VALIDATORS_TAB_VALUE.DELEGATION_NODES ? (
        <DelegationValidatorsTable />
      ) : (
        <ValidatorsTable />
      );
    case Network.DEVNET:
      return <OldValidatorsTable />;
    default:
      return <></>;
  }
}

export default function ValidatorsPageTabs(): JSX.Element {
  const [state, _] = useGlobalState();
  const {tab} = useParams();
  const navigate = useNavigate();
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();
  const value =
    tab === undefined
      ? VALIDATORS_TAB_VALUE.ALL_NODES
      : (tab as VALIDATORS_TAB_VALUE);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: VALIDATORS_TAB_VALUE,
  ) => {
    navigate(`/validators/${newValue}`);
    logEvent("validators_tab_clicked", newValue, {
      wallet_address: account?.address ?? "",
      wallet_name: wallet?.name ?? "",
    });
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={value} onChange={handleChange}>
          {VALIDATORS_TAB_VALUES.map((value, i) =>
            value === VALIDATORS_TAB_VALUE.DELEGATION_NODES ? (
              <StyledTab
                icon={
                  <Typography
                    sx={{
                      backgroundColor: "#8B5CF6",
                      color: "#ffffff",
                      borderRadius: 1,
                      paddingX: 1,
                      minWidth: "3.5rem",
                      height: "1.5rem",
                    }}
                  >
                    BETA
                  </Typography>
                }
                key={i}
                value={value}
                label={getTabLabel(value)}
                isFirst={i === 0}
                isLast={i === VALIDATORS_TAB_VALUES.length - 1}
              />
            ) : (
              <StyledTab
                key={i}
                value={value}
                label={getTabLabel(value)}
                isFirst={i === 0}
                isLast={i === VALIDATORS_TAB_VALUES.length - 1}
              />
            ),
          )}
        </StyledTabs>
      </Box>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <TabPanel value={value} networkName={state.network_name} />
      </Box>
    </Box>
  );
}
