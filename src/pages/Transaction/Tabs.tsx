import * as React from "react";
import {Box} from "@mui/material";
import {Types} from "aptos";
import {assertNever} from "../../utils";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import UserTransactionOverviewTab from "./Tabs/UserTransactionOverviewTab";
import BlockMetadataOverviewTab from "./Tabs/BlockMetadataOverviewTab";
import StateCheckpointOverviewTab from "./Tabs/StateCheckpointOverviewTab";
import PendingTransactionOverviewTab from "./Tabs/PendingTransactionOverviewTab";
import GenesisTransactionOverviewTab from "./Tabs/GenesisTransactionOverviewTab";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import EventsTab from "./Tabs/EventsTab";
import PayloadTab from "./Tabs/PayloadTab";
import ChangesTab from "./Tabs/ChangesTab";
import UnknownTab from "./Tabs/UnknownTab";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CallMergeOutlinedIcon from "@mui/icons-material/CallMergeOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BalanceChangeTab from "./Tabs/BalanceChangeTab";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../routing";
import ValidatorTransactionTab from "./Tabs/ValidatorTransactionTab";
import {TransactionTypeName} from "../../components/TransactionType";
import BlockEpilogueOverviewTab from "./Tabs/BlockEpilogueOverviewTab";
import ContentRow from "../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../components/IndividualPageContent/JsonViewCard";
import {getLearnMoreTooltip} from "./helpers";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {Link} from "../../routing";

function getTabValues(transaction: Types.Transaction): TabValue[] {
  switch (transaction.type) {
    case TransactionTypeName.User:
      return [
        "userTxnOverview",
        "balanceChange",
        "events",
        "payload",
        "changes",
      ];
    case TransactionTypeName.BlockMetadata:
      return ["blockMetadataOverview", "events", "changes"];
    case TransactionTypeName.StateCheckpoint:
      return ["stateCheckpointOverview"];
    case TransactionTypeName.Pending:
      return ["pendingTxnOverview", "payload"];
    case TransactionTypeName.Genesis:
      return ["genesisTxnOverview", "events", "payload", "changes"];
    case TransactionTypeName.Validator:
      return ["validatorTxnOverview", "events", "changes"];
    case TransactionTypeName.BlockEpilogue:
      return ["blockEpilogueOverview", "events", "changes"];
    default:
      return ["unknown", "events", "changes"];
  }
}

const TabComponents = Object.freeze({
  userTxnOverview: UserTransactionOverviewTab,
  blockMetadataOverview: BlockMetadataOverviewTab,
  blockEpilogueOverview: BlockEpilogueOverviewTab,
  stateCheckpointOverview: StateCheckpointOverviewTab,
  pendingTxnOverview: PendingTransactionOverviewTab,
  genesisTxnOverview: GenesisTransactionOverviewTab,
  validatorTxnOverview: ValidatorTransactionTab,
  balanceChange: BalanceChangeTab,
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
    case "blockEpilogueOverview":
    case "stateCheckpointOverview":
    case "pendingTxnOverview":
    case "genesisTxnOverview":
    case "validatorTxnOverview":
    case "unknown":
      return "Overview";
    case "balanceChange":
      return "Balance Change";
    case "events":
      return "Events";
    case "payload":
      return "Payload";
    case "changes":
      return "Changes";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue): React.JSX.Element {
  switch (value) {
    case "userTxnOverview":
    case "blockMetadataOverview":
    case "blockEpilogueOverview":
    case "stateCheckpointOverview":
    case "pendingTxnOverview":
    case "genesisTxnOverview":
    case "validatorTxnOverview":
      return <BarChartOutlinedIcon fontSize="small" />;
    case "balanceChange":
      return <AccountBalanceWalletOutlinedIcon fontSize="small" />;
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

function TabPanel({value, transaction}: TabPanelProps): React.JSX.Element {
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
}: TransactionTabsProps): React.JSX.Element {
  const networkName = useNetworkName();

  const {tab, txnHashOrVersion} = useParams();
  const navigate = useNavigate();
  const value =
    tab === undefined ? getTabValues(transaction)[0] : (tab as TabValue);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate(`/txn/${txnHashOrVersion}/${newValue}`, {replace: true});
  };

  return (
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
      <ContentBox>
        <ContentRow
          title="Full Txn (for debug):"
          value={<JsonViewCard data={transaction} collapsedByDefault />}
          tooltip={getLearnMoreTooltip("transaction")}
        />
        <ContentRow
          title="API link:"
          value={
            <Link
              color="inherit"
              to={`https://fullnode.${networkName.toLowerCase()}.aptoslabs.com/v1/transactions/by_hash/${transaction.hash}`}
            >
              Transaction {transaction.hash}
            </Link>
          }
          tooltip={getLearnMoreTooltip("transaction")}
        />
      </ContentBox>
    </Box>
  );
}
