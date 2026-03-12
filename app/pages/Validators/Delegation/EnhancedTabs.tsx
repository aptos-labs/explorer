import {useWallet} from "@aptos-labs/wallet-adapter-react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import {Box} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import type * as React from "react";
import StyledTab from "../../../components/StyledTab";
import StyledTabs from "../../../components/StyledTabs";
import {Network, type NetworkName} from "../../../constants";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {useNavigate} from "../../../routing";
import {addressFromWallet, assertNever} from "../../../utils";
import {useLogEventWithBasic} from "../../Account/hooks/useLogEventWithBasic";
import {DelegationValidatorsTable} from "../DelegationValidatorsTable";
import {ValidatorsTable as OldValidatorsTable} from "../Table";
import {ValidatorsTable} from "../ValidatorsTable";
import {EnhancedDelegationValidatorsTable} from "./EnhancedDelegationValidatorsTable";

enum VALIDATORS_TAB_VALUE {
  ALL_NODES = "all",
  DELEGATION_NODES = "delegation",
  ENHANCED_DELEGATION_NODES = "enhanced_delegation",
}

const VALIDATORS_TAB_VALUES: VALIDATORS_TAB_VALUE[] = [
  VALIDATORS_TAB_VALUE.ALL_NODES,
  VALIDATORS_TAB_VALUE.DELEGATION_NODES,
  VALIDATORS_TAB_VALUE.ENHANCED_DELEGATION_NODES,
];

function getTabLabel(value: VALIDATORS_TAB_VALUE): string {
  switch (value) {
    case VALIDATORS_TAB_VALUE.ALL_NODES:
      return "ALL NODES";
    case VALIDATORS_TAB_VALUE.DELEGATION_NODES:
      return "DELEGATION NODES";
    case VALIDATORS_TAB_VALUE.ENHANCED_DELEGATION_NODES:
      return "ENHANCED DELEGATION";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: VALIDATORS_TAB_VALUE): React.JSX.Element {
  switch (value) {
    case VALIDATORS_TAB_VALUE.ALL_NODES:
      return <HubOutlinedIcon fontSize="small" />;
    case VALIDATORS_TAB_VALUE.DELEGATION_NODES:
      return <GroupsOutlinedIcon fontSize="small" />;
    case VALIDATORS_TAB_VALUE.ENHANCED_DELEGATION_NODES:
      return <AutoAwesomeOutlinedIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: VALIDATORS_TAB_VALUE;
  networkName: NetworkName;
};

function TabPanel({
  value,
  networkName,
}: TabPanelProps): React.JSX.Element | null {
  switch (networkName) {
    case Network.MAINNET:
    case Network.TESTNET:
      if (value === VALIDATORS_TAB_VALUE.ALL_NODES) {
        return <ValidatorsTable />;
      } else if (value === VALIDATORS_TAB_VALUE.DELEGATION_NODES) {
        return <DelegationValidatorsTable />;
      } else if (value === VALIDATORS_TAB_VALUE.ENHANCED_DELEGATION_NODES) {
        return <EnhancedDelegationValidatorsTable />;
      }
      return null;
    case Network.DEVNET:
      return <OldValidatorsTable />;
    default:
      return null;
  }
}

export default function EnhancedValidatorsPageTabs(): React.JSX.Element {
  const networkName = useNetworkName();
  const params = useParams({strict: false}) as {tab?: string};
  const tab = params?.tab;
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
    navigate({
      to: "/validators/$tab",
      params: {tab: newValue},
    });
    logEvent("validators_tab_clicked", newValue, {
      wallet_address: addressFromWallet(account?.address),
      wallet_name: wallet?.name ?? "",
    });
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={value} onChange={handleChange}>
          {VALIDATORS_TAB_VALUES.map((tabValue, i) => (
            <StyledTab
              key={tabValue}
              value={tabValue}
              icon={getTabIcon(tabValue)}
              label={getTabLabel(tabValue)}
              isFirst={i === 0}
              isLast={i === VALIDATORS_TAB_VALUES.length - 1}
            />
          ))}
        </StyledTabs>
      </Box>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <TabPanel value={value} networkName={networkName} />
      </Box>
    </Box>
  );
}
