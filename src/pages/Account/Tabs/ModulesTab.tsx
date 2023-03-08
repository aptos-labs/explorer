import {Types} from "aptos";
import {Box, Grid, Stack, Typography, useTheme} from "@mui/material";
import React, {useState} from "react";
import {orderBy} from "lodash";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  solarizedLight,
  solarizedDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import Error from "../Error";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {useGetAccountResource} from "../../../api/hooks/useGetAccountResource";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {transformCode} from "../../../utils";
import {grey} from "../../../themes/colors/aptosColorPalette";
import StyledTabs from "../../../components/StyledTabs";
import StyledTab from "../../../components/StyledTab";
import {useGetAccountModules} from "../../../api/hooks/useGetAccountModules";
import {useGetAccountModule} from "../../../api/hooks/useGetAccountModule";

type PackageMetadata = {
  name: string;
  modules: {
    name: string;
    source: string;
  }[];
};

const CONTRACT_ACTIONS = ["View code", "Write"] as const;
type ContractAction = (typeof CONTRACT_ACTIONS)[number];

interface ModuleSidebarProps {
  moduleNames: string[];
  selectedModuleIndex: number;
  setSelectedModuleIndex: (index: number) => void;
}

interface ModuleNameOptionProps {
  handleClick: () => void;
  selected: boolean;
  name: string;
}

interface ModuleContentProps {
  address: string;
  moduleName: string;
  sourceCode: string;
}

function ModulesContent({address}: {address: string}) {
  const {data, isLoading, error} = useGetAccountModules(address);
  const modules: Types.MoveModuleBytecode[] = data ?? [];
  const {expandedList, toggleExpandedAt, expandAll, collapseAll} =
    useExpandedList(modules.length);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  if (modules.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CollapsibleCards
      expandedList={expandedList}
      expandAll={expandAll}
      collapseAll={collapseAll}
    >
      {modules.map((module, i) => (
        <CollapsibleCard
          key={i}
          titleKey="Name:"
          titleValue={module.abi?.name ?? ""}
          expanded={expandedList[i]}
          toggleExpanded={() => toggleExpandedAt(i)}
        >
          <ContentRow
            title="Bytecode:"
            value={
              <Box style={{wordWrap: "break-word", maxHeight: 60}}>
                {module.bytecode}
              </Box>
            }
          />
          <ContentRow title="ABI:" value={<JsonViewCard data={module.abi} />} />
        </CollapsibleCard>
      ))}
    </CollapsibleCards>
  );
}

function ModulesReworked({address}: {address: string}): JSX.Element {
  const [action, setAction] = useState<ContractAction>("View code");
  return (
    <Box>
      <ModulesActionTabs
        options={CONTRACT_ACTIONS}
        action={action}
        setAction={setAction}
      />
      {action === "View code" && <ViewCode address={address} />}
    </Box>
  );
}

function ModulesActionTabs({
  options,
  action,
  setAction,
}: {
  options: readonly ContractAction[];
  action: ContractAction;
  setAction: (action: ContractAction) => void;
}) {
  return (
    <Box padding={2} marginY={4} borderRadius={1}>
      <StyledTabs value={action} onChange={(e, v) => setAction(v)}>
        {options.map((value, i) => (
          <StyledTab
            key={i}
            value={value}
            label={value}
            isFirst={i === 0}
            isLast={i === options.length - 1}
          />
        ))}
      </StyledTabs>
    </Box>
  );
}

function ViewCode({address}: {address: string}): JSX.Element {
  const {data: registry} = useGetAccountResource(
    address,
    "0x1::code::PackageRegistry",
  );

  const [selectedModuleIndex, setSelectedModuleIndex] =
    React.useState<number>(0);

  const packages: PackageMetadata[] =
    registry === undefined ? [] : (registry.data as any).packages;
  const modules = orderBy(
    packages.flatMap((p) => p.modules),
    "name",
  );

  if (modules.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item md={3}>
        <ModuleSidebar
          moduleNames={modules.map((m) => m.name)}
          selectedModuleIndex={selectedModuleIndex}
          setSelectedModuleIndex={setSelectedModuleIndex}
        />
      </Grid>
      <Grid item md={9}>
        <ModuleContent
          address={address}
          moduleName={modules[selectedModuleIndex].name}
          sourceCode={modules[selectedModuleIndex].source}
        />
      </Grid>
    </Grid>
  );
}

function ModuleSidebar({
  moduleNames,
  selectedModuleIndex,
  setSelectedModuleIndex,
}: ModuleSidebarProps) {
  return (
    <Box sx={{padding: "24px"}}>
      <Typography fontSize={16} fontWeight={500} marginBottom={"24px"}>
        Modules
      </Typography>
      <Box
        sx={{
          maxHeight: "500px",
          overflowY: "auto",
        }}
      >
        {moduleNames.map((moduleName, i) => (
          <ModuleNameOption
            key={i}
            handleClick={() => setSelectedModuleIndex(i)}
            selected={i === selectedModuleIndex}
            name={moduleName}
          />
        ))}
      </Box>
    </Box>
  );
}

function ModuleNameOption({
  handleClick,
  selected,
  name,
}: ModuleNameOptionProps) {
  const theme = useTheme();

  return (
    <Box
      key={name}
      onClick={handleClick}
      sx={{
        fontSize: 12,
        fontWeight: 500,
        padding: "8px",
        bgcolor: !selected
          ? "transparent"
          : theme.palette.mode === "dark"
          ? grey[500]
          : grey[200],
        ":hover": {
          cursor: "pointer",
        },
      }}
    >
      {name}
    </Box>
  );
}

function ModuleContent({address, moduleName, sourceCode}: ModuleContentProps) {
  return (
    <Stack direction="column" spacing={2} padding={"24px"}>
      <Typography fontSize={28} fontWeight={700}>
        {moduleName}
      </Typography>
      <Code sourceCode={sourceCode} />
      <ABI address={address} moduleName={moduleName} />
    </Stack>
  );
}

function Code({sourceCode}: {sourceCode: string}) {
  const theme = useTheme();
  return (
    <Box>
      <Typography fontSize={24} fontWeight={700} marginY={"16px"}>
        Code
      </Typography>
      {sourceCode === "0x" ? (
        <Box>
          Unfortunately, the source code cannot be shown because the package
          publisher has chosen not to make it available
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: "500px",
            overflowY: "auto",
            borderRadius: 1,
          }}
        >
          <SyntaxHighlighter
            language="rust"
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
          >
            {transformCode(sourceCode)}
          </SyntaxHighlighter>
        </Box>
      )}
    </Box>
  );
}

function ABI({address, moduleName}: {address: string; moduleName: string}) {
  const {
    data: module,
    isLoading,
    error,
  } = useGetAccountModule(address, moduleName);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  if (!module) {
    return <EmptyTabContent />;
  }

  return (
    <Box>
      <Typography fontSize={24} fontWeight={700} marginY={"16px"}>
        ABI
      </Typography>
      <JsonViewCard data={module.abi} />
    </Box>
  );
}

type ModulesTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function ModulesTab({address}: ModulesTabProps) {
  const inDev = useGetInDevMode();
  return inDev ? (
    <ModulesReworked address={address} />
  ) : (
    <ModulesContent address={address} />
  );
}
