import * as React from "react";
import {Box} from "@mui/material";
import TransactionsTab from "./Tabs/TransactionsTab";
import InfoTab from "./Tabs/InfoTab";
import {assertNever} from "../../utils";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import {useNavigate, useSearch} from "../../routing";
import HoldersTab from "./Tabs/HoldersTab";
import {FACombinedData} from "./Index";

const TAB_VALUES: TabValue[] = ["info", "holders", "transactions"];

const TabComponents = Object.freeze({
  transactions: TransactionsTab,
  holders: HoldersTab,
  info: InfoTab,
});

export type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "info":
      return "Info";
    case "holders":
      return "Beta - Holders";
    case "transactions":
      return "Beta - Transactions";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue): React.JSX.Element {
  switch (value) {
    case "info":
      return <DescriptionOutlinedIcon fontSize="small" />;
    case "holders":
      return <WysiwygIcon fontSize="small" />;
    case "transactions":
      return <WysiwygIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  address: string;
  data: FACombinedData | undefined;
};

function TabPanel({value, address, data}: TabPanelProps): React.JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent address={address} data={data} />;
}

type FATabsProps = {
  address: string;
  data: FACombinedData | undefined;
  tabValues?: TabValue[];
};

// TODO: create reusable Tabs for all pages
export default function FATabs({
  address,
  data,
  tabValues = TAB_VALUES,
}: FATabsProps): React.JSX.Element {
  const search = useSearch({strict: false}) as {
    tab?: string;
    modulesTab?: string;
  };
  const navigate = useNavigate();

  let effectiveTab: TabValue;
  if (search?.modulesTab) {
    effectiveTab = "modules" as TabValue;
  } else if (
    search?.tab !== undefined &&
    tabValues.includes(search.tab as TabValue)
  ) {
    effectiveTab = search.tab as TabValue;
  } else {
    effectiveTab = TAB_VALUES[0];
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate({
      to: `/fungible_asset/${address}`,
      search: {tab: newValue},
      replace: true,
    });
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={effectiveTab} onChange={handleChange}>
          {tabValues.map((value, i) => (
            <StyledTab
              key={`${i}-${value}`}
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
        <TabPanel value={effectiveTab} address={address} data={data} />
      </Box>
    </Box>
  );
}
