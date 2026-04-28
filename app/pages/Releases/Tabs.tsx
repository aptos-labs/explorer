import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import {Box} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import type * as React from "react";
import StyledTab from "../../components/StyledTab";
import StyledTabs from "../../components/StyledTabs";
import {useNavigate} from "../../routing";
import AIpsTab from "./AIPsTab";
import DeploymentsTab from "./DeploymentsTab";
import SdksTab from "./SdksTab";

export enum RELEASES_TAB_VALUE {
  NETWORKS = "networks",
  AIPS = "aips",
  SDKS = "sdks",
}

export const DEFAULT_RELEASES_TAB = RELEASES_TAB_VALUE.NETWORKS;

const TAB_LABEL: Record<RELEASES_TAB_VALUE, string> = {
  [RELEASES_TAB_VALUE.NETWORKS]: "Networks",
  [RELEASES_TAB_VALUE.AIPS]: "AIPs",
  [RELEASES_TAB_VALUE.SDKS]: "SDKs & Tools",
};

const TAB_ICON: Record<RELEASES_TAB_VALUE, React.JSX.Element> = {
  [RELEASES_TAB_VALUE.NETWORKS]: <HubOutlinedIcon fontSize="small" />,
  [RELEASES_TAB_VALUE.AIPS]: <RuleOutlinedIcon fontSize="small" />,
  [RELEASES_TAB_VALUE.SDKS]: <LayersOutlinedIcon fontSize="small" />,
};

const TAB_VALUES: ReadonlyArray<RELEASES_TAB_VALUE> = [
  RELEASES_TAB_VALUE.NETWORKS,
  RELEASES_TAB_VALUE.AIPS,
  RELEASES_TAB_VALUE.SDKS,
];

export function isReleasesTab(value: string): value is RELEASES_TAB_VALUE {
  return (TAB_VALUES as ReadonlyArray<string>).includes(value);
}

export function releasesTabHeadTitle(tab: string): string {
  if (isReleasesTab(tab)) return TAB_LABEL[tab];
  return TAB_LABEL[DEFAULT_RELEASES_TAB];
}

function TabPanel({value}: {value: RELEASES_TAB_VALUE}): React.JSX.Element {
  switch (value) {
    case RELEASES_TAB_VALUE.NETWORKS:
      return <DeploymentsTab />;
    case RELEASES_TAB_VALUE.AIPS:
      return <AIpsTab />;
    case RELEASES_TAB_VALUE.SDKS:
      return <SdksTab />;
  }
}

export default function ReleasesPageTabs(): React.JSX.Element {
  const params = useParams({strict: false}) as {tab?: string};
  const navigate = useNavigate();

  const value =
    params.tab && isReleasesTab(params.tab) ? params.tab : DEFAULT_RELEASES_TAB;

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: RELEASES_TAB_VALUE,
  ) => {
    navigate({to: "/releases/$tab", params: {tab: newValue}});
  };

  return (
    <Box sx={{width: "100%"}}>
      <Box>
        <StyledTabs value={value} onChange={handleChange}>
          {TAB_VALUES.map((tabValue, i) => (
            <StyledTab
              key={tabValue}
              value={tabValue}
              icon={TAB_ICON[tabValue]}
              label={TAB_LABEL[tabValue]}
              isFirst={i === 0}
              isLast={i === TAB_VALUES.length - 1}
            />
          ))}
        </StyledTabs>
      </Box>
      <Box sx={{width: "auto", overflowX: "auto", mt: 3}}>
        <TabPanel value={value} />
      </Box>
    </Box>
  );
}
