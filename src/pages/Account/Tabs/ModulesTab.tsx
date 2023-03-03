import {Types} from "aptos";
import {Box, Grid, Stack, Typography, useTheme} from "@mui/material";
import React from "react";
import {orderBy} from "lodash";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  solarizedLight,
  solarizedDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import Error from "../Error";
import {useGlobalState} from "../../../GlobalState";
import {ResponseError} from "../../../api/client";
import {useQuery} from "react-query";
import {getAccountModules, getAccountModule} from "../../../api";
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

type PackageMetadata = {
  name: string;
  modules: {
    name: string;
    source: string;
  }[];
};

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
  const [state, _] = useGlobalState();

  const {isLoading, data, error} = useQuery<
    Array<Types.MoveModuleBytecode>,
    ResponseError
  >(["accountModules", {address}, state.network_value], () =>
    getAccountModules({address}, state.network_value),
  );

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

function ModulesContentReworked({address}: {address: string}): JSX.Element {
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
    <Grid container spacing={2} marginTop="24px">
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
  const codeString = transformCode(sourceCode);
  return (
    <Box>
      <Typography fontSize={24} fontWeight={700} marginY={"16px"}>
        Code
      </Typography>
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
          {codeString}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
}

function ABI({address, moduleName}: {address: string; moduleName: string}) {
  const [state, _] = useGlobalState();

  const {
    isLoading,
    data: module,
    error,
  } = useQuery<Types.MoveModuleBytecode, ResponseError>(
    ["accountModule", {address, moduleName}, state.network_value],
    () => getAccountModule({address, moduleName}, state.network_value),
  );

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
    <ModulesContentReworked address={address} />
  ) : (
    <ModulesContent address={address} />
  );
}
