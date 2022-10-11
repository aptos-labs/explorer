import * as React from "react";
import {useState} from "react";
import {Tabs, Tab, Box} from "@mui/material";
import {Types} from "aptos";
import {assertNever} from "../../utils";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import UserTransactionOverviewTab from "./Tabs/UserTransactionOverviewTab";
import BlockMetadataOverviewTab from "./Tabs/BlockMetadataOverviewTab";
import StateCheckpointOverviewTab from "./Tabs/StateCheckpointOverviewTab";
import PendingTransactionOverviewTab from "./Tabs/PendingTransactionOverviewTab";
import GenesisTransactionOverviewTab from "./Tabs/GenesisTransactionOverviewTab";
import EventsTab from "./Tabs/EventsTab";
import PayloadTab from "./Tabs/PayloadTab";
import ChangesTab from "./Tabs/ChangesTab";
import UnknownTab from "./Tabs/UnknownTab";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CallMergeOutlinedIcon from "@mui/icons-material/CallMergeOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import {useGetInGtmMode} from "../../api/hooks/useGetInDevMode";

function getTabValues(transaction: Types.Transaction): TabValue[] {
  switch (transaction.type) {
    case "user_transaction":
      return ["userTxnOverview", "events", "payload", "changes"];
    case "block_metadata_transaction":
      return ["blockMetadataOverview", "changes"];
    case "state_checkpoint_transaction":
      return ["stateCheckpointOverview"];
    case "pending_transaction":
      return ["pendingTxnOverview", "payload"];
    case "genesis_transaction":
      return ["genesisTxnOverview", "events", "payload", "changes"];
    default:
      return ["unknown"];
  }
}

const TabComponents = Object.freeze({
  userTxnOverview: UserTransactionOverviewTab,
  blockMetadataOverview: BlockMetadataOverviewTab,
  stateCheckpointOverview: StateCheckpointOverviewTab,
  pendingTxnOverview: PendingTransactionOverviewTab,
  genesisTxnOverview: GenesisTransactionOverviewTab,
  events: EventsTab,
  payload: PayloadTab,
  changes: ChangesTab,
  unknown: UnknownTab,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "userTxnOverview":
    case "blockMetadataOverview":
    case "stateCheckpointOverview":
    case "pendingTxnOverview":
    case "genesisTxnOverview":
      return "Overview";
    case "events":
      return "Events";
    case "payload":
      return "Payload";
    case "changes":
      return "Changes";
    case "unknown":
      return "Unknown";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue): JSX.Element {
  switch (value) {
    case "userTxnOverview":
    case "blockMetadataOverview":
    case "stateCheckpointOverview":
    case "pendingTxnOverview":
    case "genesisTxnOverview":
      return <BarChartOutlinedIcon fontSize="small" />;
    case "events":
      return <CallMergeOutlinedIcon fontSize="small" />;
    case "payload":
      return <FileCopyOutlinedIcon fontSize="small" />;
    case "changes":
      return <CodeOutlinedIcon fontSize="small" />;
    case "unknown":
      return <HelpOutlineOutlinedIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  transaction: Types.Transaction;
};

function TabPanel({value, transaction}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent transaction={transaction} />;
}

type TransactionTabsProps = {
  transaction: Types.Transaction;
  tabValues?: TabValue[];
};

export default function TransactionTabs({
  transaction,
  tabValues = getTabValues(transaction),
}: TransactionTabsProps): JSX.Element {
  const inGtm = useGetInGtmMode();
  const [value, setValue] = useState<TabValue>(tabValues[0]);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
  };

  // TODO: use LinkTab for better navigation
  return inGtm ? (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={value} onChange={handleChange}>
          {tabValues.map((value, i) => (
            <StyledTab
              key={i}
              value={value}
              icon={getTabIcon(value)}
              label={getTabLabel(value)}
              isFirst={i === 0}
              isLast={i === tabValues.length - 1}
            />
          ))}
        </StyledTabs>
      </Box>
      <Box>
        <TabPanel value={value} transaction={transaction} />
      </Box>
    </Box>
  ) : (
    <Box sx={{width: "100%"}}>
      <Box sx={{borderBottom: 1, borderColor: "divider"}}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="account page tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabValues.map((value, i) => (
            <Tab
              key={i}
              label={getTabLabel(value)}
              value={value}
              sx={{fontSize: {xs: "medium", md: "large"}}}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{marginY: 3}}>
        <TabPanel value={value} transaction={transaction} />
      </Box>
    </Box>
  );
}
