import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import {Box} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import type * as React from "react";
import type {CoinDescription} from "../../api/hooks/useGetCoinList";
import type {SupplyType} from "../../api/hooks/useGetCoinSupplyLimit";
import StyledTab from "../../components/StyledTab";
import StyledTabs from "../../components/StyledTabs";
import {useNavigate} from "../../routing";
import {assertNever} from "../../utils";
import type {CoinData} from "./Components/CoinData";
import HoldersTab from "./Tabs/HoldersTab";
import InfoTab from "./Tabs/InfoTab";
import TransactionsTab from "./Tabs/TransactionsTab";

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
    case "transactions":
      return "Beta - Transactions";
    case "holders":
      return "Beta - Holders";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue) {
  switch (value) {
    case "info":
      return <DescriptionOutlinedIcon fontSize="small" />;
    case "transactions":
      return <WysiwygIcon fontSize="small" />;
    case "holders":
      return <WysiwygIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  struct: string;
  data: CoinData | undefined;
  supplyInfo: [bigint | null, SupplyType | null];
  pairedFa: string | null;
  coinData: CoinDescription | undefined;
};

function TabPanel({
  value,
  struct,
  data,
  supplyInfo,
  pairedFa,
  coinData,
}: TabPanelProps) {
  const TabComponent = TabComponents[value];
  return (
    <TabComponent
      struct={struct}
      data={data}
      supplyInfo={supplyInfo}
      pairedFa={pairedFa}
      coinData={coinData}
    />
  );
}

type CoinTabsProps = {
  struct: string;
  data: CoinData | undefined;
  tabValues?: TabValue[];
  supplyInfo: [bigint | null, SupplyType | null];
  pairedFa: string | null;
  coinData: CoinDescription | undefined;
};

// TODO: create reusable Tabs for all pages
export default function CoinTabs({
  struct,
  data,
  tabValues = TAB_VALUES,
  supplyInfo,
  pairedFa,
  coinData,
}: CoinTabsProps) {
  const params = useParams({strict: false}) as {struct?: string; tab?: string};
  const navigate = useNavigate();

  let effectiveTab: TabValue;
  if (params?.tab !== undefined && tabValues.includes(params.tab as TabValue)) {
    effectiveTab = params.tab as TabValue;
  } else {
    effectiveTab = TAB_VALUES[0];
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate({
      to: "/coin/$struct/$tab",
      params: {struct, tab: newValue},
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
        <TabPanel
          value={effectiveTab}
          struct={struct}
          data={data}
          supplyInfo={supplyInfo}
          pairedFa={pairedFa}
          coinData={coinData}
        />
      </Box>
    </Box>
  );
}
