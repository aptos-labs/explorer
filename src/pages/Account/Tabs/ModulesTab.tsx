import {Types} from "aptos";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  Modal,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {useState} from "react";
import {orderBy} from "lodash";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  solarizedLight,
  solarizedDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Error from "../Error";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import CollapsibleCards from "../../../components/IndividualPageContent/CollapsibleCards";
import CollapsibleCard from "../../../components/IndividualPageContent/CollapsibleCard";
import useExpandedList from "../../../components/hooks/useExpandedList";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {useGetAccountResource} from "../../../api/hooks/useGetAccountResource";
import {assertNever, getBytecodeSizeInKB, transformCode} from "../../../utils";
import {grey} from "../../../themes/colors/aptosColorPalette";
import StyledTabs from "../../../components/StyledTabs";
import StyledTab from "../../../components/StyledTab";
import {useGetAccountModules} from "../../../api/hooks/useGetAccountModules";
import {useGetAccountModule} from "../../../api/hooks/useGetAccountModule";
import {WalletConnector} from "@aptos-labs/wallet-adapter-mui-design";
import {useGlobalState} from "../../../GlobalState";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";
import StyledTooltip from "../../../components/StyledTooltip";
import {OpenInFull} from "@mui/icons-material";
import {useNavigate, useParams} from "react-router-dom";

const TabComponents = Object.freeze({
  code: ViewCode,
  write: WriteContract,
});

type TabValue = keyof typeof TabComponents;

function getTabLabel(value: TabValue): string {
  switch (value) {
    case "code":
      return "View Code";
    case "write":
      return "Write";
    default:
      return assertNever(value);
  }
}

type TabPanelProps = {
  value: TabValue;
  address: string;
};

function TabPanel({value, address}: TabPanelProps): JSX.Element {
  const TabComponent = TabComponents[value];
  return <TabComponent address={address} />;
}

function ModulesTabs({address}: {address: string}): JSX.Element {
  const theme = useTheme();
  const tabValues = Object.keys(TabComponents) as TabValue[];
  const {modulesTab} = useParams();
  const navigate = useNavigate();
  const value =
    modulesTab === undefined ? tabValues[0] : (modulesTab as TabValue);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    navigate(`/account/${address}/modules/${newValue}`);
  };

  return (
    <Box sx={{width: "100%"}}>
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
        <TabPanel value={value} address={address} />
      </Box>
    </Box>
  );
}

type PackageMetadata = {
  name: string;
  modules: {
    name: string;
    source: string;
  }[];
};

type WriteContractFormType = {
  typeArgs: string[];
  args: string[];
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
  bytecode: string;
}

interface WriteContractSidebarProps {
  selectedModuleName: string | undefined;
  selectedFnName: string | undefined;
  moduleAndFnsGroup: Record<string, Types.MoveFunction[]>;
  handleClick: (moduleName: string, fnName: string) => void;
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
      <Grid item md={3} xs={12}>
        <ModuleSidebar
          moduleNames={modules.map((m) => m.name)}
          selectedModuleIndex={selectedModuleIndex}
          setSelectedModuleIndex={setSelectedModuleIndex}
        />
      </Grid>
      <Grid item md={9} xs={12}>
        <ModuleContent
          address={address}
          moduleName={modules[selectedModuleIndex].name}
          bytecode={modules[selectedModuleIndex].source}
        />
      </Grid>
    </Grid>
  );
}

function WriteContract({address}: {address: string}) {
  const {data, isLoading, error} = useGetAccountModules(address);
  const [selectedModuleName, setSelectedModuleName] = useState<string>();
  const [selectedFnName, setSelectedFnName] = useState<string>();

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  const modules = data ?? [];
  if (modules.length === 0) {
    return <EmptyTabContent />;
  }

  const moduleAndFnsGroup = modules.reduce((acc, module) => {
    if (module.abi === undefined) {
      return acc;
    }

    const fns = module.abi.exposed_functions.filter((fn) => fn.is_entry);
    if (fns.length === 0) {
      return acc;
    }

    const moduleName = module.abi.name;
    return {
      ...acc,
      [moduleName]: fns,
    } as Record<string, Types.MoveFunction[]>;
  }, {} as Record<string, Types.MoveFunction[]>);

  const module = modules.find((m) => m.abi?.name === selectedModuleName)?.abi;
  const fn = selectedModuleName
    ? moduleAndFnsGroup[selectedModuleName]?.find(
        (fn) => fn.name === selectedFnName,
      )
    : undefined;

  return (
    <Grid container spacing={2}>
      <Grid item md={3} xs={12}>
        <WriteContractSidebar
          selectedModuleName={selectedModuleName}
          selectedFnName={selectedFnName}
          moduleAndFnsGroup={moduleAndFnsGroup}
          handleClick={(moduleName: string, fnName: string) => {
            setSelectedModuleName(moduleName);
            setSelectedFnName(fnName);
          }}
        />
      </Grid>
      <Grid item md={9} xs={12}>
        {!module || !fn ? (
          <EmptyTabContent message="Please selet a function" />
        ) : (
          <WriteContractForm module={module} fn={fn} />
        )}
      </Grid>
    </Grid>
  );
}

function WriteContractSidebar({
  selectedModuleName,
  selectedFnName,
  moduleAndFnsGroup,
  handleClick,
}: WriteContractSidebarProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{padding: "24px"}}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <Typography fontSize={16} fontWeight={500} marginBottom={"24px"}>
        Select function
      </Typography>
      <Box
        sx={{
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {Object.entries(moduleAndFnsGroup).map(([moduleName, fns]) => (
          <Box key={moduleName} marginY={3}>
            <Typography fontSize={14} fontWeight={500} marginBottom={"8px"}>
              {moduleName}
            </Typography>
            {fns.map((fn) => {
              const selected =
                moduleName === selectedModuleName && fn.name === selectedFnName;
              return (
                <Box
                  key={fn.name}
                  onClick={() => handleClick(moduleName, fn.name)}
                  fontSize={12}
                  fontWeight={selected ? 600 : 400}
                  marginBottom={"8px"}
                  padding={1}
                  borderRadius={1}
                  sx={{
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
                  {fn.name}
                </Box>
              );
            })}
            <Divider />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function WriteContractForm({
  module,
  fn,
}: {
  module: Types.MoveModule;
  fn: Types.MoveFunction;
}) {
  const [state] = useGlobalState();
  const {account, connected} = useWallet();
  const {handleSubmit, control} = useForm<WriteContractFormType>();
  const {submitTransaction} = useSubmitTransaction();
  const theme = useTheme();

  const onSubmit: SubmitHandler<WriteContractFormType> = async (data) => {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${module.address}::${module.name}::${fn.name}`,
      type_arguments: data.typeArgs,
      arguments: data.args,
    };
    await submitTransaction(payload);
  };

  const hasSigner = fn.params.length > 0 && fn.params[0] === "&signer";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack
        spacing={4}
        bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
        borderRadius={1}
      >
        <Typography fontSize={14}>
          {fn.name}
          {fn.generic_type_params.length > 0 &&
            "<" +
              [...Array(fn.generic_type_params.length)].map((_, i) => `T${i}`) +
              ">"}
          ({fn.params.join(", ")})
        </Typography>
        <Stack spacing={4}>
          {[...Array(fn.generic_type_params.length)].map((_, i) => (
            <Controller
              key={i}
              name={`typeArgs.${i}`}
              control={control}
              render={({field: {onChange, value}}) => (
                <TextField
                  onChange={onChange}
                  value={value}
                  label={`T${i}`}
                  fullWidth
                />
              )}
            />
          ))}
          {fn.params.map((param, i) => {
            if (i === 0 && hasSigner) {
              return (
                <TextField
                  key={i}
                  fullWidth
                  disabled
                  value={account?.address ?? ""}
                  label={"account: &signer"}
                />
              );
            }
            return (
              <Controller
                key={i}
                name={`args.${hasSigner ? i - 1 : i}`}
                control={control}
                render={({field: {onChange, value}}) => (
                  <TextField
                    onChange={onChange}
                    value={value}
                    label={`arg${hasSigner ? i - 1 : i}: ${param}`}
                    fullWidth
                  />
                )}
              />
            );
          })}
        </Stack>
        {connected ? (
          <Button type="submit" variant="contained" sx={{maxWidth: "8rem"}}>
            Write
          </Button>
        ) : (
          <Box display="flex" flexDirection="row" alignItems="center">
            <WalletConnector networkSupport={state.network_name} />
            <Typography ml={2}>
              To write you need to connect wallet first
            </Typography>
          </Box>
        )}
      </Stack>
    </form>
  );
}

function ModuleSidebar({
  moduleNames,
  selectedModuleIndex,
  setSelectedModuleIndex,
}: ModuleSidebarProps) {
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={{padding: "24px"}}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <Typography fontSize={16} fontWeight={500} marginBottom={"24px"}>
        Modules
      </Typography>
      {isWideScreen ? (
        <Box
          sx={{
            maxHeight: "100vh",
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
      ) : (
        <FormControl fullWidth>
          <Select
            value={selectedModuleIndex}
            onChange={(e) => setSelectedModuleIndex(Number(e.target.value))}
          >
            {moduleNames.map((moduleName, i) => (
              <MenuItem key={i} value={i}>
                {moduleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
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
        fontWeight: selected ? 600 : 400,
        padding: "8px",
        borderRadius: 1,
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

function ModuleContent({address, moduleName, bytecode}: ModuleContentProps) {
  const theme = useTheme();
  return (
    <Stack
      direction="column"
      spacing={2}
      padding={"24px"}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <ModuleHeader address={address} moduleName={moduleName} />
      <Divider />
      <Code bytecode={bytecode} />
      <Divider />
      <ABI address={address} moduleName={moduleName} />
    </Stack>
  );
}

function ModuleHeader({
  address,
  moduleName,
}: {
  address: string;
  moduleName: string;
}) {
  const {data: module} = useGetAccountModule(address, moduleName);

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography fontSize={28} fontWeight={700}>
        {moduleName}
      </Typography>
      <Box>
        {module && (
          <Typography fontSize={10}>
            {module.abi?.exposed_functions?.filter((fn) => fn.is_entry)?.length}{" "}
            entry functions | Bytecode: {getBytecodeSizeInKB(module.bytecode)}{" "}
            KB
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function Code({bytecode}: {bytecode: string}) {
  const TOOLTIP_TIME = 2000; // 2s

  const sourceCode = bytecode === "0x" ? undefined : transformCode(bytecode);

  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  async function copyCode(event: React.MouseEvent<HTMLButtonElement>) {
    if (!sourceCode) return;

    await navigator.clipboard.writeText(sourceCode);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={24} fontWeight={700} marginY={"16px"}>
          Code
        </Typography>
        <Stack direction="row" spacing={2}>
          <StyledTooltip
            title="Code copied"
            placement="right"
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Button
              variant="outlined"
              onClick={copyCode}
              disabled={!sourceCode}
              sx={{
                display: "flex",
                alignItems: "center",
                height: "2rem",
                borderRadius: "0.5rem",
              }}
            >
              <ContentCopyIcon style={{height: "1.25rem", width: "1.25rem"}} />{" "}
              <Typography marginLeft={1}>copy code</Typography>
            </Button>
          </StyledTooltip>
          <ExpandCode sourceCode={sourceCode} />
        </Stack>
      </Box>
      {!sourceCode ? (
        <Box>
          Unfortunately, the source code cannot be shown because the package
          publisher has chosen not to make it available
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: "100vh",
            overflowY: "auto",
            borderRadius: 1,
          }}
        >
          <SyntaxHighlighter
            language="rust"
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{margin: 0}}
            showLineNumbers
          >
            {sourceCode}
          </SyntaxHighlighter>
        </Box>
      )}
    </Box>
  );
}

function ExpandCode({sourceCode}: {sourceCode: string | undefined}) {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleOpenModal}
        disabled={!sourceCode}
        sx={{
          height: "2rem",
          width: "2rem",
          minWidth: "unset",
          borderRadius: "0.5rem",
        }}
      >
        <OpenInFull style={{height: "1.25rem", width: "1.25rem"}} />
      </Button>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "80%",
            maxWidth: "80%",
            overflowY: "auto",
            borderRadius: 1,
          }}
        >
          <SyntaxHighlighter
            language="rust"
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{margin: 0}}
            showLineNumbers
          >
            {sourceCode!}
          </SyntaxHighlighter>
        </Box>
      </Modal>
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
};

export default function ModulesTab({address}: ModulesTabProps) {
  const [state, _] = useGlobalState();
  if (state.feature_name === "earlydev")
    return <ModulesTabs address={address} />;
  if (state.feature_name === "dev")
    return (
      <Box marginTop={4}>
        <ViewCode address={address} />
      </Box>
    );
  return <ModulesContent address={address} />;
}
