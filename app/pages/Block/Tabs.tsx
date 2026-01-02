import * as React from "react";
import {Box} from "@mui/material";
import OverviewTab from "./Tabs/OverviewTab";
import TransactionsTab from "./Tabs/TransactionsTab";
import {assertNever} from "../../utils";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import {useParams} from "@tanstack/react-router";
import {useNavigate, useSearch} from "../../routing";
import {Block} from "@aptos-labs/ts-sdk";

const TAB_VALUES: TabValue[] = ["overview", "transactions"];

const TabComponents = Object.freeze({
  overview: OverviewTab,
  transactions: TransactionsTab,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "overview":
      return "Overview";
    case "transactions":
      return "Transactions";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue) {
  switch (value) {
    case "overview":
      return <BarChartOutlinedIcon fontSize="small" />;
    case "transactions":
      return <WysiwygIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  data: Block;
};

function TabPanel({value, data}: TabPanelProps) {
  const TabComponent = TabComponents[value];
  return <TabComponent data={data} />;
}

type AccountTabsProps = {
  data: Block;
  tabValues?: TabValue[];
};

export default function BlockTabs({
  data,
  tabValues = TAB_VALUES,
}: AccountTabsProps) {
  const params = useParams({strict: false}) as {height?: string};
  const search = useSearch({strict: false}) as {tab?: string};
  const height = params?.height;
  const tab = search?.tab;
  const navigate = useNavigate();
  const value = tab === undefined ? TAB_VALUES[0] : (tab as TabValue);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate({
      to: `/block/${height}`,
      search: {tab: newValue},
      replace: true,
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
              icon={getTabIcon(value)}
              label={getTabLabel(value)}
              isFirst={i === 0}
              isLast={i === tabValues.length - 1}
            />
          ))}
        </StyledTabs>
      </Box>
      <Box>
        <TabPanel value={value} data={data} />
      </Box>
    </Box>
  );
}
