import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import {Box} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import type * as React from "react";
import type {Current_Token_Datas_V2} from "~/types/aptos";
import StyledTab from "../../components/StyledTab";
import StyledTabs from "../../components/StyledTabs";
import {useNavigate, useSearch} from "../../routing";
import {assertNever} from "../../utils";
import ActivitiesTab from "./Tabs/ActivitiesTab";
import OverviewTab from "./Tabs/OverviewTab";

const TAB_VALUES: TabValue[] = ["overview", "activities"];

const TabComponents = Object.freeze({
  overview: OverviewTab,
  activities: ActivitiesTab,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "overview":
      return "Overview";
    case "activities":
      return "Activities";
    default:
      return assertNever(value);
  }
}

function getTabIcon(value: TabValue): React.JSX.Element {
  switch (value) {
    case "overview":
      return <BarChartOutlinedIcon fontSize="small" />;
    case "activities":
      return <WysiwygIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  data: Current_Token_Datas_V2;
};

function TabPanel({value, data}: TabPanelProps): React.JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent data={data} />;
}

type AccountTabsProps = {
  data: Current_Token_Datas_V2;
  tabValues?: TabValue[];
};

export default function TokenTabs({
  data,
  tabValues = TAB_VALUES,
}: AccountTabsProps): React.JSX.Element {
  const params = useParams({strict: false}) as {tokenId?: string; tab?: string};
  const search = useSearch({strict: false}) as {propertyVersion?: string};
  const tokenId = params?.tokenId;
  const propertyVersion = search?.propertyVersion;
  const tab = params?.tab;
  const navigate = useNavigate();
  const value = tab === undefined ? TAB_VALUES[0] : (tab as TabValue);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate({
      to: "/token/$tokenId/$tab",
      params: {tokenId: tokenId ?? "", tab: newValue},
      search: propertyVersion ? {propertyVersion} : undefined,
      replace: true,
    });
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={value} onChange={handleChange}>
          {tabValues.map((value, i) => (
            <StyledTab
              key={value}
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
