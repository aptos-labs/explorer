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
import {useGetAccountPackages} from "../../../../api/hooks/useGetAccountResource";

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
  const sortedPackages = useGetAccountPackages(address);
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

    const {moduleNameParam, fnNameParam} = (() => {
      if (value === "packages" && newValue !== "packages") {
        // From packages to other tabs: convert package name to first module name
        if (selectedModuleName) {
          const selectedPackage = sortedPackages.find(
            (pkg) => pkg.name === selectedModuleName,
          );
          if (selectedPackage && selectedPackage.modules.length > 0) {
            return {
              moduleNameParam: selectedPackage.modules[0].name,
              fnNameParam: "",
            };
          }
        }
        return {moduleNameParam: "", fnNameParam: ""};
      } else if (value !== "packages" && newValue === "packages") {
        // From other tabs to packages: convert module name to package name
        if (selectedModuleName) {
          const packageForModule = sortedPackages.find((pkg) =>
            pkg.modules.some((mod) => mod.name === selectedModuleName),
          );
          if (packageForModule) {
            return {
              moduleNameParam: packageForModule.name,
              fnNameParam: "",
            };
          }
        }
        return {moduleNameParam: "", fnNameParam: ""};
      } else if (value !== "packages" && newValue !== "packages") {
        // Between non-packages tabs: preserve module name and function name
        return {
          moduleNameParam: selectedModuleName || "",
          fnNameParam: selectedFnName ? `/${selectedFnName}` : "",
        };
      }
      // If both are packages or no conversion needed, leave params empty
      return {moduleNameParam: "", fnNameParam: ""};
    })();

    navigate(
      `/${accountPagePath(isObject)}/${address}/modules/${newValue}${moduleNameParam ? `/${moduleNameParam}` : ""}${fnNameParam}`,
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
