import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {Box, Tooltip, useTheme} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import type React from "react";
import {useEffect, useState} from "react";
import {useGetAccountPackages} from "../../../../api/hooks/useGetAccountResource";
import {useGetModulePublishHistory} from "../../../../api/hooks/useGetModulePublishHistory";
import StyledTab from "../../../../components/StyledTab";
import StyledTabs from "../../../../components/StyledTabs";
import {useNavigate} from "../../../../routing";
import {assertNever} from "../../../../utils";
import {pathSplatToSegments} from "../../../../utils/routerParams";
import {useLogEventWithBasic} from "../../hooks/useLogEventWithBasic";
import {accountPagePath} from "../../Index";
import Contract from "./Contract";
import ModuleDiffView from "./ModuleDiffView";
import ModuleVersionSelector from "./ModuleVersionSelector";
import Packages from "./Packages";
import ViewCode from "./ViewCode";

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

function getTabIcon(value: TabValue): React.JSX.Element {
  switch (value) {
    case "packages":
      return <InventoryOutlinedIcon fontSize="small" />;
    case "code":
      return <CodeOutlinedIcon fontSize="small" />;
    case "run":
      return <PlayArrowOutlinedIcon fontSize="small" />;
    case "view":
      return <VisibilityOutlinedIcon fontSize="small" />;
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  address: string;
  isObject: boolean;
  ledgerVersion?: number;
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

function TabPanel({value, address, isObject, ledgerVersion}: TabPanelProps) {
  const TabComponent = TabComponents[value];
  return (
    <TabComponent
      address={address}
      isObject={isObject}
      ledgerVersion={ledgerVersion}
    />
  );
}

/**
 * Parse modules path params from the splat route.
 * Path format: /account/:address/modules/:modulesTab/:moduleName?/:fnName?
 * The splat param contains everything after /modules/
 */
export function useModulesPathParams() {
  const params = useParams({strict: false}) as {
    address?: string;
    _splat?: unknown;
  };

  const splatParts = pathSplatToSegments(params._splat);

  const modulesTab = splatParts[0] as TabValue | undefined;
  const selectedModuleName = splatParts[1];
  const selectedFnName = splatParts[2];

  return {
    modulesTab,
    selectedModuleName,
    selectedFnName,
  };
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
  const [ledgerVersion, setLedgerVersion] = useState<number | undefined>(
    undefined,
  );
  const [diffMode, setDiffMode] = useState(false);
  const [diffBaseVersion, setDiffBaseVersion] = useState<number | undefined>(
    undefined,
  );
  const [diffCompareVersion, setDiffCompareVersion] = useState<
    number | undefined
  >(undefined);

  const {data: publishHistory} = useGetModulePublishHistory(address);

  // Parse path params from splat route
  const {modulesTab, selectedModuleName, selectedFnName} =
    useModulesPathParams();

  const navigate = useNavigate();
  const logEvent = useLogEventWithBasic();
  const sortedPackages = useGetAccountPackages(address, ledgerVersion);
  const value =
    modulesTab === undefined ? tabValues[0] : (modulesTab as TabValue);

  const resolveModuleNameForCodeTab = (): string => {
    if (value !== "packages" && selectedModuleName) {
      return selectedModuleName;
    }
    if (value === "packages" && selectedModuleName) {
      const pkg = sortedPackages.find((p) => p.name === selectedModuleName);
      if (pkg && pkg.modules.length > 0) {
        return pkg.modules[0].name;
      }
    }
    if (sortedPackages.length > 0 && sortedPackages[0].modules.length > 0) {
      return sortedPackages[0].modules[0].name;
    }
    return "";
  };

  const navigateToCodeTab = () => {
    if (value !== "code") {
      const moduleName = resolveModuleNameForCodeTab();
      let path = `/${accountPagePath(isObject)}/${address}/modules/code`;
      if (moduleName) {
        path += `/${moduleName}`;
      }
      navigate({to: path, replace: true});
    }
  };

  const handleVersionChange = (version: number | undefined) => {
    setLedgerVersion(version);
    if (version !== undefined) {
      navigateToCodeTab();
    }
  };

  const handleDiffModeToggle = () => {
    if (!diffMode && publishHistory && publishHistory.length >= 2) {
      setDiffBaseVersion(publishHistory[1].version);
      setDiffCompareVersion(undefined);
      setLedgerVersion(undefined);
      navigateToCodeTab();
    }
    setDiffMode(!diffMode);
  };

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
          fnNameParam: selectedFnName || "",
        };
      }
      // If both are packages or no conversion needed, leave params empty
      return {moduleNameParam: "", fnNameParam: ""};
    })();

    // Build path-based URL
    let path = `/${accountPagePath(isObject)}/${address}/modules/${newValue}`;
    if (moduleNameParam) {
      path += `/${moduleNameParam}`;
      if (fnNameParam) {
        path += `/${fnNameParam}`;
      }
    }

    navigate({
      to: path,
      replace: true,
    });
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
  }, [value, logEvent]);

  return (
    <Box
      sx={{
        width: "100%",
        "& *::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "& *::-webkit-scrollbar-track": {},
        "& *::-webkit-scrollbar-thumb": {
          background:
            theme.palette.mode === "dark"
              ? theme.palette.neutralShade.lighter
              : theme.palette.neutralShade.darker,
          borderRadius: "10px",
          padding: "2px",
        },
        "& *::-webkit-scrollbar-thumb:hover": {
          background:
            theme.palette.mode === "dark"
              ? theme.palette.neutralShade.main
              : theme.palette.neutralShade.main,
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
        bgcolor={theme.palette.background.paper}
      >
        <ModuleVersionSelector
          address={address}
          selectedVersion={ledgerVersion}
          onVersionChange={handleVersionChange}
          diffMode={diffMode}
          onDiffModeToggle={handleDiffModeToggle}
        />
        <Box mt={2}>
          <StyledTabs value={value} onChange={handleChange}>
            {tabValues.map((tabKey, i) => {
              const isDisabled =
                ledgerVersion !== undefined &&
                (tabKey === "run" || tabKey === "view");
              const tab = (
                <StyledTab
                  secondary
                  key={tabKey}
                  value={tabKey}
                  icon={getTabIcon(tabKey)}
                  label={getTabLabel(tabKey)}
                  isFirst={i === 0}
                  isLast={i === tabValues.length - 1}
                  disabled={isDisabled}
                />
              );
              if (isDisabled) {
                return (
                  <Tooltip
                    key={tabKey}
                    title="Run and View are not available for historical versions"
                    arrow
                  >
                    <span>{tab}</span>
                  </Tooltip>
                );
              }
              return tab;
            })}
          </StyledTabs>
        </Box>
      </Box>
      <Box>
        {diffMode && publishHistory && publishHistory.length >= 2 ? (
          <ModuleDiffView
            address={address}
            moduleName={selectedModuleName || ""}
            publishHistory={publishHistory}
            baseVersion={diffBaseVersion}
            compareVersion={diffCompareVersion}
            onBaseVersionChange={setDiffBaseVersion}
            onCompareVersionChange={setDiffCompareVersion}
          />
        ) : (
          <TabPanel
            value={value}
            address={address}
            isObject={isObject}
            ledgerVersion={ledgerVersion}
          />
        )}
      </Box>
    </Box>
  );
}

export default ModulesTabs;
