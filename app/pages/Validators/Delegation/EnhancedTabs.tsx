import * as React from "react";
import {Box} from "@mui/material";
import {addressFromWallet, assertNever} from "../../../utils";
import StyledTabs from "../../../components/StyledTabs";
import StyledTab from "../../../components/StyledTab";
import {ValidatorsTable} from "../ValidatorsTable";
import {DelegationValidatorsTable} from "../DelegationValidatorsTable";
import {EnhancedDelegationValidatorsTable} from "./EnhancedDelegationValidatorsTable";
import {Network, NetworkName} from "../../../constants";
import {ValidatorsTable as OldValidatorsTable} from "../Table";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useNavigate} from "../../../routing";
import {useLogEventWithBasic} from "../../Account/hooks/useLogEventWithBasic";
import {useParams} from "@tanstack/react-router";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

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

function TabPanel({value, networkName}: TabPanelProps): React.JSX.Element {
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
      return <></>;
    case Network.DEVNET:
      return <OldValidatorsTable />;
    default:
      return <></>;
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
          {VALIDATORS_TAB_VALUES.map((value, i) => (
            <StyledTab
              key={i}
              value={value}
              icon={getTabIcon(value)}
              label={getTabLabel(value)}
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
