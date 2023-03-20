import {Types} from "aptos";
import {
  Box,
  Button,
  Divider,
  Grid,
  Modal,
  Stack,
  TextField,
  Typography,
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
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {getBytecodeSizeInKB, transformCode} from "../../../utils";
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
      {action === "Write" && <WriteContract address={address} />}
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
  return (
    <Box
      sx={{padding: "24px"}}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <Typography fontSize={16} fontWeight={500} marginBottom={"24px"}>
        Modules
      </Typography>
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
            >
              <ContentCopyIcon />{" "}
              <Typography marginLeft={2}>copy code</Typography>
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
      >
        <OpenInFull />
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
