import * as React from "react";
import {useState} from "react";
import {Tabs, Tab, Box} from "@mui/material";
import RawDataTab from "./RawDataTab/Index";
import TransactionTab from "./TransactionsTab/Index";
import {assertNever} from "../../utils";

const TAB_VALUES: TabValue[] = ["transactions", "rawData"];

const TabComponents = Object.freeze({
  transactions: TransactionTab,
  rawData: RawDataTab,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "transactions":
      return "Account Transactions";
    case "rawData":
      return "Raw Data";
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
  const [value, setValue] = useState<TabValue>(tabValues[0]);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
  };

  // TODO: use LinkTab for better navigation
  return (
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
