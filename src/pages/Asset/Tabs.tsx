import * as React from "react";
import {Box} from "@mui/material";
import TransactionsTab from "./Tabs/TransactionsTab";
import InfoTab from "./Tabs/InfoTab";
import {assertNever} from "../../utils";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import CoinsTab from "./Tabs/CoinsTab";
import {Types} from "aptos";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../routing";

const TAB_VALUES: TabValue[] = ["transactions", "info"];

const TabComponents = Object.freeze({
  transactions: TransactionsTab,
  coins: CoinsTab,
  info: InfoTab,
});

export type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "transactions":
      return "Transactions";
    case "coins":
      return "Coins";
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
    case "info":
      return <DescriptionOutlinedIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  address: string;
  accountData: Types.MoveResource[] | undefined;
};

function TabPanel({value, address, accountData}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent address={address} accountData={accountData} />;
}

type AccountTabsProps = {
  address: string;
  accountData: Types.MoveResource[] | undefined;
  tabValues?: TabValue[];
};

// TODO: create reusable Tabs for all pages
export default function AccountTabs({
  address,
  accountData,
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
    navigate(`/asset/${address}/${newValue}`, {
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
        />
      </Box>
    </Box>
  );
}
