import * as React from "react";
import {useState} from "react";
import {Tabs, Tab, Box} from "@mui/material";
import RawDataTab from "./RawDataTab/Index";
import TransactionTab from "./TransactionsTab/Index";
import {assertNever} from "../../utils";

const TabComponents = Object.freeze({
  transactions: TransactionTab,
  rawData: RawDataTab,
});

type TabValue = keyof typeof TabComponents;

const TAB_VALUES: TabValue[] = ["transactions", "rawData"];

type TabLabelProps = {
  value: TabValue;
};

function TabLabel({value, ...rest}: TabLabelProps) {
  switch (value) {
    case "transactions":
      return (
        <Tab
          label="Account Transactions"
          value="transactions"
          sx={{fontSize: "large"}}
          {...rest}
        />
      );
    case "rawData":
      return (
        <Tab
          label="Raw Data"
          value="rawData"
          sx={{fontSize: "large"}}
          {...rest}
        />
      );
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

export default function AccountTabs({
  address,
  tabValues = TAB_VALUES,
}: AccountTabsProps): JSX.Element {
  const [value, setValue] = useState<TabValue>(TAB_VALUES[0]);

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
        >
          {tabValues.map((value) => (
            <TabLabel key={value} value={value} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{marginY: 3}}>
        <TabPanel value={value} address={address} />
      </Box>
    </Box>
  );
}
