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
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import TokensTab from "./Tabs/TokensTab";
import CoinsTab from "./Tabs/CoinsTab";
import {Types} from "aptos";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../routing";

const TAB_VALUES: TabValue[] = ["transactions", "resources", "modules", "info"];

const TabComponents = Object.freeze({
  transactions: TransactionsTab,
  coins: CoinsTab,
  tokens: TokensTab,
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

function getTabIcon(value: TabValue): JSX.Element {
  switch (value) {
    case "transactions":
      return <WysiwygIcon fontSize="small" />;
    case "coins":
      return <MonetizationOnOutlinedIcon fontSize="small" />;
    case "tokens":
      return <AccountBalanceWalletOutlinedIcon fontSize="small" />;
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
  accountData: Types.AccountData | Types.MoveResource[] | undefined;
};

function TabPanel({value, address, accountData}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent address={address} accountData={accountData} />;
}

type AccountTabsProps = {
  address: string;
  accountData: Types.AccountData | Types.MoveResource[] | undefined;
  tabValues?: TabValue[];
  isObject?: boolean;
};

// TODO: create reusable Tabs for all pages
export default function AccountTabs({
  address,
  accountData,
  isObject = false,
  tabValues = TAB_VALUES,
}: AccountTabsProps): JSX.Element {
  const {tab, modulesTab} = useParams();
  const navigate = useNavigate();
  let effectiveTab: TabValue;
  if (modulesTab) {
    effectiveTab = "modules" as TabValue;
  } else if (tab !== undefined) {
    effectiveTab = tab as TabValue;
  } else {
    effectiveTab = TAB_VALUES[0];
  }

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    if (isObject) {
      navigate(`/object/${address}/${newValue}`, {replace: true});
    } else {
      navigate(`/account/${address}/${newValue}`, {replace: true});
    }
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
        />
      </Box>
    </Box>
  );
}
