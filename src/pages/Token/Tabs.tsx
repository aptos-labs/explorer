import * as React from "react";
import {Box} from "@mui/material";
import OverviewTab from "./Tabs/OverviewTab";
import ActivitiesTab from "./Tabs/ActivitiesTab";
import {assertNever} from "../../utils";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import StyledTabs from "../../components/StyledTabs";
import StyledTab from "../../components/StyledTab";
import {useParams} from "react-router-dom";
import {useNavigate} from "../../routing";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // TODO: add graphql data typing
};

function TabPanel({value, data}: TabPanelProps): React.JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent data={data} />;
}

type AccountTabsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // TODO: add graphql data typing
  tabValues?: TabValue[];
};

export default function TokenTabs({
  data,
  tabValues = TAB_VALUES,
}: AccountTabsProps): React.JSX.Element {
  const {propertyVersion, tab, tokenId} = useParams();
  const navigate = useNavigate();
  const value = tab === undefined ? TAB_VALUES[0] : (tab as TabValue);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate(`/token/${tokenId}/${propertyVersion}/${newValue}`, {
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
