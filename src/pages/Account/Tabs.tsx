import * as React from "react";
import {useState} from "react";
import {Tabs, Tab, Box} from "@mui/material";
import TransactionsTab from "./Tabs/TransactionsTab";
import InfoTab from "./Tabs/InfoTab";
import ResourcesTab from "./Tabs/ResourcesTab";
import ModulesTab from "./Tabs/ModulesTab";
import {assertNever} from "../../utils";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import ExtensionIcon from "@mui/icons-material/Extension";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";

const TAB_VALUES: TabValue[] = ["transactions", "resources", "modules", "info"];

const TabComponents = Object.freeze({
  transactions: TransactionsTab,
  info: InfoTab,
  resources: ResourcesTab,
  modules: ModulesTab,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "transactions":
      return "Transactions";
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
};

function TabPanel({value, address}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent address={address} />;
}

type AccountTabsProps = {
  address: string;
  tabValues?: TabValue[];
};

// TODO: create reusable Tabs for all pages
export default function AccountTabs({
  address,
  tabValues = TAB_VALUES,
}: AccountTabsProps): JSX.Element {
  const inDev = useGetInDevMode();
  const [value, setValue] = useState<TabValue>(tabValues[0]);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
  };

  // TODO: use LinkTab for better navigation
  return inDev ? (
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
        <TabPanel value={value} address={address} />
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
        <TabPanel value={value} address={address} />
      </Box>
    </Box>
  );
}
