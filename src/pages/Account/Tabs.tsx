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
};

export default function AccountTabs({address}: AccountTabsProps): JSX.Element {
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
          <Tab
            label="Account Transactions"
            value={TAB_VALUES[0]}
            sx={{fontSize: "large"}}
          />
          <Tab
            label="Raw Data"
            value={TAB_VALUES[1]}
            sx={{fontSize: "large"}}
          />
        </Tabs>
      </Box>
      <Box sx={{marginY: 3}}>
        <TabPanel value={value} address={address} />
      </Box>
    </Box>
  );
}
