import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import RawDataTab from "./RawDataTab/Index";
import TransactionTab from "./TransactionsTab/Index";

function tabProps(index: number) {
  return {
    "aria-controls": `tabpanel-${index}`,
  };
}

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps): JSX.Element {
  const {children, value, index} = props;

  return (
    <div hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && (
        <Box sx={{p: 3}}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

type AccountTabsProps = {
  address: string;
};

export default function AccountTabs({address}: AccountTabsProps): JSX.Element {
  const [tabIdx, setTabIdx] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newIdx: number) => {
    setTabIdx(newIdx);
  };

  // TODO: use LinkTab for better navigation
  return (
    <Box sx={{width: "100%"}}>
      <Box sx={{borderBottom: 1, borderColor: "divider"}}>
        <Tabs
          value={tabIdx}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab
            label="Account Transactions"
            sx={{fontSize: "large"}}
            {...tabProps(0)}
          />
          <Tab label="Raw Data" sx={{fontSize: "large"}} {...tabProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={tabIdx} index={0}>
        <TransactionTab address={address} />
      </TabPanel>
      <TabPanel value={tabIdx} index={1}>
        <RawDataTab address={address} />
      </TabPanel>
    </Box>
  );
}
