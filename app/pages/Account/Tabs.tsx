import * as React from "react";
import {Box} from "@mui/material";
import TransactionsTab from "./Tabs/TransactionsTab";
import InfoTab from "./Tabs/InfoTab";
import ResourcesTab from "./Tabs/ResourcesTab";
import ModulesTab from "./Tabs/ModulesTab";
import {assertNever} from "../../utils";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import ExtensionIcon from "@mui/icons-material/Extension";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupIcon from "@mui/icons-material/Group";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import TokensTab from "./Tabs/TokensTab";
import CoinsTab from "./Tabs/CoinsTab";
import MultisigTab from "./Tabs/MultisigTab";
import {Types} from "aptos";
import {useNavigate, useSearch} from "../../routing";
import {accountPagePath} from "./Index";
import {useParams} from "@tanstack/react-router";

const TAB_VALUES: TabValue[] = ["transactions", "resources", "modules", "info"];

const TabComponents = Object.freeze({
  transactions: TransactionsTab,
  coins: CoinsTab,
  tokens: TokensTab,
  multisig: MultisigTab,
  resources: ResourcesTab,
  modules: ModulesTab,
  info: InfoTab,
});

export type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "transactions":
      return "Transactions";
    case "coins":
      return "Coins";
    case "tokens":
      return "Tokens";
    case "multisig":
      return "Multisig";
    case "resources":
      return "Resources";
    case "modules":
      return "Modules";
    case "info":
      return "Info";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue) {
  switch (value) {
    case "transactions":
      return <WysiwygIcon fontSize="small" />;
    case "coins":
      return <MonetizationOnOutlinedIcon fontSize="small" />;
    case "tokens":
      return <AccountBalanceWalletOutlinedIcon fontSize="small" />;
    case "multisig":
      return <GroupIcon fontSize="small" />;
    case "resources":
      return <DynamicFeedIcon fontSize="small" />;
    case "modules":
      return <ExtensionIcon fontSize="small" />;
    case "info":
      return <DescriptionOutlinedIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  address: string;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
  resourceData: Types.MoveResource[] | undefined;
  isObject: boolean;
};

function TabPanel({
  value,
  address,
  accountData,
  objectData,
  resourceData,
  isObject,
}: TabPanelProps): React.JSX.Element {
  const TabComponent = TabComponents[value];
  return (
    <TabComponent
      address={address}
      accountData={accountData}
      objectData={objectData}
      resourceData={resourceData}
      isObject={isObject}
    />
  );
}

type AccountTabsProps = {
  address: string;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
  resourceData: Types.MoveResource[] | undefined;
  tabValues?: TabValue[];
  isObject?: boolean;
};

// TODO: create reusable Tabs for all pages
export default function AccountTabs({
  address,
  accountData,
  objectData,
  resourceData,
  isObject = false,
  tabValues = TAB_VALUES,
}: AccountTabsProps) {
  // Use path params for tab selection in TanStack Router
  const params = useParams({strict: false}) as {tab?: string};
  const search = useSearch({strict: false}) as {modulesTab?: string};
  const navigate = useNavigate();

  let effectiveTab: TabValue;
  if (search?.modulesTab) {
    effectiveTab = "modules" as TabValue;
  } else if (
    params?.tab !== undefined &&
    tabValues.includes(params.tab as TabValue)
  ) {
    effectiveTab = params.tab as TabValue;
  } else {
    effectiveTab = TAB_VALUES[0];
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    const basePath = accountPagePath(isObject);
    navigate({
      to: `/${basePath}/$address/$tab`,
      params: {address, tab: newValue},
      replace: true,
    });
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={effectiveTab} onChange={handleChange}>
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
        <TabPanel
          value={effectiveTab}
          address={address}
          accountData={accountData}
          objectData={objectData}
          resourceData={resourceData}
          isObject={isObject}
        />
      </Box>
    </Box>
  );
}
