import {ErrorOutlineOutlined as ErrorOutline} from "@mui/icons-material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CallMergeOutlinedIcon from "@mui/icons-material/CallMergeOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import * as React from "react";
import {useEffect, useState} from "react";
import type {Types} from "~/types/aptos";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../components/IndividualPageContent/JsonViewCard";
import StyledTab from "../../components/StyledTab";
import StyledTabs from "../../components/StyledTabs";
import {TransactionTypeName} from "../../components/TransactionType";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {useNavigate} from "../../routing";
import {assertNever} from "../../utils";
import {isDecibelTransaction} from "../../utils/decibel";
import {rewriteTxnTab} from "../../utils/routeRedirects";
import {getLearnMoreTooltip} from "./helpers";
import BalanceChangeTab from "./Tabs/BalanceChangeTab";
import BlockEpilogueOverviewTab from "./Tabs/BlockEpilogueOverviewTab";
import BlockMetadataOverviewTab from "./Tabs/BlockMetadataOverviewTab";
import ChangesTab from "./Tabs/ChangesTab";
import DecibelTab from "./Tabs/DecibelTab";
import EventsTab from "./Tabs/EventsTab";
import GenesisTransactionOverviewTab from "./Tabs/GenesisTransactionOverviewTab";
import PayloadTab from "./Tabs/PayloadTab";
import PendingTransactionOverviewTab from "./Tabs/PendingTransactionOverviewTab";
import StateCheckpointOverviewTab from "./Tabs/StateCheckpointOverviewTab";
import TransactionModulesTab from "./Tabs/TransactionModulesTab";
import TransactionTraceTab from "./Tabs/TransactionTraceTab";
import UnknownTab from "./Tabs/UnknownTab";
import UserTransactionOverviewTab from "./Tabs/UserTransactionOverviewTab";
import ValidatorTransactionTab from "./Tabs/ValidatorTransactionTab";
import {transactionHasModuleSummary} from "./transactionModuleChanges";

function insertModulesTabBeforeChanges(tabs: TabValue[]): TabValue[] {
  const i = tabs.indexOf("changes");
  if (i === -1) return [...tabs, "modules"];
  return [...tabs.slice(0, i), "modules", ...tabs.slice(i)];
}

function withModulesTabWhenApplicable(
  transaction: Types.Transaction,
  tabs: TabValue[],
): TabValue[] {
  return transactionHasModuleSummary(transaction)
    ? insertModulesTabBeforeChanges(tabs)
    : tabs;
}

export function getTabValues(transaction: Types.Transaction): TabValue[] {
  switch (transaction.type) {
    case TransactionTypeName.User: {
      const tabs: TabValue[] = ["overview"];
      if (isDecibelTransaction(transaction)) {
        tabs.push("decibelDetail");
      }
      tabs.push("balanceChange", "events", "payload", "changes", "trace");
      return withModulesTabWhenApplicable(transaction, tabs);
    }
    case TransactionTypeName.BlockMetadata:
      return withModulesTabWhenApplicable(transaction, [
        "overview",
        "events",
        "changes",
      ]);
    case TransactionTypeName.StateCheckpoint:
      return ["overview"];
    case TransactionTypeName.Pending:
      return ["overview", "payload"];
    case TransactionTypeName.Genesis:
      return withModulesTabWhenApplicable(transaction, [
        "overview",
        "events",
        "payload",
        "changes",
      ]);
    case TransactionTypeName.Validator:
      return withModulesTabWhenApplicable(transaction, [
        "overview",
        "events",
        "changes",
      ]);
    case TransactionTypeName.BlockEpilogue:
      return withModulesTabWhenApplicable(transaction, [
        "overview",
        "events",
        "changes",
      ]);
    default:
      return withModulesTabWhenApplicable(transaction, [
        "overview",
        "events",
        "changes",
      ]);
  }
}

function OverviewTab({
  transaction,
}: {
  transaction: Types.Transaction;
}): React.JSX.Element {
  switch (transaction.type) {
    case TransactionTypeName.User:
      return <UserTransactionOverviewTab transaction={transaction} />;
    case TransactionTypeName.BlockMetadata:
      return <BlockMetadataOverviewTab transaction={transaction} />;
    case TransactionTypeName.BlockEpilogue:
      return <BlockEpilogueOverviewTab transaction={transaction} />;
    case TransactionTypeName.StateCheckpoint:
      return <StateCheckpointOverviewTab transaction={transaction} />;
    case TransactionTypeName.Pending:
      return <PendingTransactionOverviewTab transaction={transaction} />;
    case TransactionTypeName.Genesis:
      return <GenesisTransactionOverviewTab transaction={transaction} />;
    case TransactionTypeName.Validator:
      return <ValidatorTransactionTab transaction={transaction} />;
    default:
      return <UnknownTab transaction={transaction} />;
  }
}

const TabComponents = Object.freeze({
  overview: OverviewTab,
  decibelDetail: DecibelTab,
  balanceChange: BalanceChangeTab,
  events: EventsTab,
  payload: PayloadTab,
  modules: TransactionModulesTab,
  changes: ChangesTab,
  trace: TransactionTraceTab,
});

export type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "overview":
      return "Overview";
    case "decibelDetail":
      return "Decibel";
    case "balanceChange":
      return "Balance Change";
    case "events":
      return "Events";
    case "payload":
      return "Payload";
    case "modules":
      return "Modules";
    case "changes":
      return "Changes";
    case "trace":
      return "Trace";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue): React.JSX.Element {
  switch (value) {
    case "overview":
      return <BarChartOutlinedIcon fontSize="small" />;
    case "decibelDetail":
      return <ShowChartOutlinedIcon fontSize="small" />;
    case "balanceChange":
      return <AccountBalanceWalletOutlinedIcon fontSize="small" />;
    case "events":
      return <CallMergeOutlinedIcon fontSize="small" />;
    case "payload":
      return <FileCopyOutlinedIcon fontSize="small" />;
    case "modules":
      return <ViewModuleOutlinedIcon fontSize="small" />;
    case "changes":
      return <CodeOutlinedIcon fontSize="small" />;
    case "trace":
      return <AccountTreeOutlinedIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  transaction: Types.Transaction;
};

function TabPanel({value, transaction}: TabPanelProps): React.JSX.Element {
  const theme = useTheme();
  const TabComponent = TabComponents[value];
  if (!TabComponent) {
    return (
      <ContentBox>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "flex-start",
          }}
        >
          <ErrorOutline
            sx={{
              color: theme.palette.error.main,
              fontSize: 28,
              mt: 0.5,
            }}
          />
          <Stack spacing={1} sx={{flex: 1}}>
            <Typography variant="h6" color="error">
              Invalid Tab
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
              }}
            >
              The tab "{value}" is not valid for this transaction type.
            </Typography>
          </Stack>
        </Stack>
      </ContentBox>
    );
  }
  return <TabComponent transaction={transaction} />;
}

type TransactionDebugInfoProps = {
  transaction: Types.Transaction;
  networkName: string;
};

function TransactionDebugInfo({
  transaction,
  networkName,
}: TransactionDebugInfoProps): React.JSX.Element {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      sx={{
        marginTop: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: `${theme.shape.borderRadius}px !important`,
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: 0,
          marginTop: 3,
        },
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          padding: 4,
          "& .MuiAccordionSummary-content": {
            margin: 0,
          },
        }}
      >
        <Typography
          variant="body1"
          sx={{color: theme.palette.text.secondary, fontWeight: 500}}
        >
          Transaction Debug Info
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{padding: 4, paddingTop: 0}}>
        {expanded && (
          <Stack direction="column" spacing={4}>
            <ContentRow
              title="Full Txn (for debug):"
              value={<JsonViewCard data={transaction} collapsedByDefault />}
              tooltip={getLearnMoreTooltip("transaction")}
            />
            <ContentRow
              title="API link:"
              value={
                <a
                  style={{color: "inherit"}}
                  href={`https://fullnode.${networkName.toLowerCase()}.aptoslabs.com/v1/transactions/by_hash/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Transaction {transaction.hash}
                </a>
              }
              tooltip={getLearnMoreTooltip("transaction")}
            />
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
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

  const params = useParams({strict: false}) as {
    txnHashOrVersion?: string;
    tab?: string;
  };
  const tab = params?.tab;
  const txnHashOrVersion = params?.txnHashOrVersion;
  const navigate = useNavigate();

  // Validate tab value - check if it exists in TabComponents and is valid for this transaction
  const isValidTab = React.useCallback(
    (tabName: string | undefined): tabName is TabValue => {
      if (!tabName) return false;
      return (
        tabName in TabComponents && tabValues.includes(tabName as TabValue)
      );
    },
    [tabValues],
  );

  const defaultTab = tabValues[0];
  const rewrittenTab = tab ? rewriteTxnTab(tab) : undefined;
  const value = isValidTab(rewrittenTab) ? rewrittenTab : defaultTab;

  // Rewrite legacy overview tab names (and any other invalid tab) to the
  // canonical path without adding a history entry.
  useEffect(() => {
    if (tab && tab !== value) {
      navigate({
        to: "/txn/$txnHashOrVersion/$tab",
        params: {txnHashOrVersion: txnHashOrVersion ?? "", tab: value},
        replace: true,
      });
    }
  }, [tab, value, txnHashOrVersion, navigate]);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate({
      to: "/txn/$txnHashOrVersion/$tab",
      params: {txnHashOrVersion: txnHashOrVersion ?? "", tab: newValue},
      replace: true,
    });
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={value} onChange={handleChange}>
          {tabValues.map((value, i) => (
            <StyledTab
              key={value}
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
      {value === defaultTab && (
        <TransactionDebugInfo
          transaction={transaction}
          networkName={networkName}
        />
      )}
    </Box>
  );
}
