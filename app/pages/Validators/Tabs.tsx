import * as React from "react";
import {Box} from "@mui/material";
import {addressFromWallet, assertNever} from "../../utils";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import {useSearch} from "../../routing";
import {ValidatorsTable} from "./ValidatorsTable";
import {DelegationValidatorsTable} from "./DelegationValidatorsTable";
import {Network, NetworkName} from "../../constants";
import {ValidatorsTable as OldValidatorsTable} from "./Table";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useNavigate} from "../../routing";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {EnhancedDelegationValidatorsTable} from "./Delegation/EnhancedDelegationValidatorsTable";

enum VALIDATORS_TAB_VALUE {
  ALL_NODES = "all",
  DELEGATION_NODES = "delegation",
  ENHANCED_DELEGATION_NODES = "enhanced_delegation",
}

function getTabLabel(value: VALIDATORS_TAB_VALUE): string {
  switch (value) {
    case VALIDATORS_TAB_VALUE.ALL_NODES:
      return "All Nodes";
    case VALIDATORS_TAB_VALUE.DELEGATION_NODES:
      return "Delegation Nodes";
    case VALIDATORS_TAB_VALUE.ENHANCED_DELEGATION_NODES:
      return "Delegation (New Beta UI)";
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

export default function ValidatorsPageTabs(): React.JSX.Element {
  const networkName = useNetworkName();
  const search = useSearch({strict: false}) as {tab?: string};
  const tab = search?.tab;
  const navigate = useNavigate();
  const {account, wallet} = useWallet();
  const logEvent = useLogEventWithBasic();

  const value =
    tab === undefined
      ? VALIDATORS_TAB_VALUE.ALL_NODES
      : (tab as VALIDATORS_TAB_VALUE);

  // Define tab values based on URL parameter
  const tabValues = [
    VALIDATORS_TAB_VALUE.ALL_NODES,
    VALIDATORS_TAB_VALUE.DELEGATION_NODES,
    VALIDATORS_TAB_VALUE.ENHANCED_DELEGATION_NODES,
  ];

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: VALIDATORS_TAB_VALUE,
  ) => {
    navigate({
      to: "/validators",
      search: {tab: newValue},
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
          {tabValues.map((value, i) => (
            <StyledTab
              key={i}
              value={value}
              label={getTabLabel(value)}
              isFirst={i === 0}
              isLast={i === tabValues.length - 1}
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
