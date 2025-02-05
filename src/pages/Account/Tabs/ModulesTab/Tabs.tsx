import {Box, useTheme} from "@mui/material";
import React, {useEffect} from "react";
import {useParams} from "react-router-dom";
import StyledTab from "../../../../components/StyledTab";
import StyledTabs from "../../../../components/StyledTabs";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {assertNever} from "../../../../utils";
import ViewCode from "./ViewCode";
import Contract from "./Contract";
import {useNavigate} from "../../../../routing";
import {useLogEventWithBasic} from "../../hooks/useLogEventWithBasic";
import {accountPagePath} from "../../Index";
import Packages from "./Packages";

const TabComponents = Object.freeze({
  packages: Packages,
  code: ViewCode,
  run: RunContract,
  view: ReadContract,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "packages":
      return "Packages";
    case "code":
      return "Code";
    case "run":
      return "Run";
    case "view":
      return "View";
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  address: string;
  isObject: boolean;
};

function RunContract({
  address,
  isObject,
}: {
  address: string;
  isObject: boolean;
}) {
  return <Contract address={address} isObject={isObject} isRead={false} />;
}

function ReadContract({
  address,
  isObject,
}: {
  address: string;
  isObject: boolean;
}) {
  return <Contract address={address} isObject={isObject} isRead={true} />;
}

function TabPanel({value, address, isObject}: TabPanelProps) {
  const TabComponent = TabComponents[value];
  return <TabComponent address={address} isObject={isObject} />;
}

function ModulesTabs({
  address,
  isObject,
}: {
  address: string;
  isObject: boolean;
}) {
  const theme = useTheme();
  const tabValues = Object.keys(TabComponents) as TabValue[];
  const {selectedFnName, selectedModuleName, modulesTab} = useParams();
  const navigate = useNavigate();
  const logEvent = useLogEventWithBasic();
  const value =
    modulesTab === undefined ? tabValues[0] : (modulesTab as TabValue);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    let eventName = "";
    switch (newValue) {
      case "packages":
        break;
      case "code":
        // no event needed
        break;
      case "run":
        eventName = "write_tab_clicked";
        break;
      case "view":
        eventName = "read_tab_clicked";
        break;
    }
    if (eventName) {
      logEvent(eventName);
    }

    navigate(
      `/${accountPagePath(isObject)}/${address}/modules/${newValue}/${selectedModuleName}` +
        (selectedFnName ? `/${selectedFnName}` : ``),
      {replace: true},
    );
  };

  useEffect(() => {
    let eventName = "";
    switch (value) {
      case "packages":
        eventName = "package_tab_viewed";
        break;
      case "code":
        eventName = "modules_tab_viewed";
        break;
      case "run":
        eventName = "write_tab_viewed";
        break;
      case "view":
        eventName = "read_tab_viewed";
        break;
    }
    if (eventName) {
      logEvent(eventName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Box
      sx={{
        width: "100%",
        "& *::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "& *::-webkit-scrollbar-track": {
          // boxShadow: "inset 0 0 5px grey",
          // borderRadius: "10px",
        },
        "& *::-webkit-scrollbar-thumb": {
          background: theme.palette.mode === "dark" ? grey[500] : grey[200],
          borderRadius: "10px",
          padding: "2px",
        },
        "& *::-webkit-scrollbar-thumb:hover": {
          background: theme.palette.mode === "dark" ? grey[400] : grey[300],
        },
        "& *::-webkit-scrollbar-corner": {
          opacity: 0,
        },
      }}
    >
      <Box
        padding={2}
        marginY={4}
        borderColor="red"
        borderRadius={1}
        bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      >
        <StyledTabs value={value} onChange={handleChange}>
          {tabValues.map((value, i) => (
            <StyledTab
              secondary
              key={i}
              value={value}
              label={getTabLabel(value)}
              isFirst={i === 0}
              isLast={i === tabValues.length - 1}
            />
          ))}
        </StyledTabs>
      </Box>
      <Box>
        <TabPanel value={value} address={address} isObject={isObject} />
      </Box>
    </Box>
  );
}

export default ModulesTabs;
