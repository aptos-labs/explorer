import * as React from "react";
import {Box} from "@mui/material";
import TransactionsTab from "./Tabs/TransactionsTab";
import InfoTab from "./Tabs/InfoTab";
import {assertNever} from "../../utils";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../routing";
import {CoinData} from "./Components/CoinData";
import {CoinDescription} from "../../api/hooks/useGetCoinList";
import HoldersTab from "./Tabs/HoldersTab";

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
      return "Transactions";
    case "holders":
      return "Holders";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue): JSX.Element {
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
  supply: bigint | null;
  pairedFa: string | null;
  coinData: CoinDescription | undefined;
};

function TabPanel({
  value,
  struct,
  data,
  supply,
  pairedFa,
  coinData,
}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return (
    <TabComponent
      struct={struct}
      data={data}
      supply={supply}
      pairedFa={pairedFa}
      coinData={coinData}
    />
  );
}

type CoinTabsProps = {
  struct: string;
  data: CoinData | undefined;
  tabValues?: TabValue[];
  supply: bigint | null;
  pairedFa: string | null;
  coinData: CoinDescription | undefined;
};

// TODO: create reusable Tabs for all pages
export default function CoinTabs({
  struct,
  data,
  tabValues = TAB_VALUES,
  supply,
  pairedFa,
  coinData,
}: CoinTabsProps): JSX.Element {
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
    navigate(`/coin/${struct}/${newValue}`, {
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
          supply={supply}
          pairedFa={pairedFa}
          coinData={coinData}
        />
      </Box>
    </Box>
  );
}
