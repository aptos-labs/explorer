import {Types} from "aptos";
import {ReactNode, useEffect, useMemo, useState} from "react";
import ErrorPage from "../../Error";
import {useGetAccountModules} from "../../../../api/hooks/useGetAccountModules";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
import SidebarItem from "../../Components/SidebarItem";
import {WalletConnector} from "../../../../components/WalletConnector";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import {
  Grid,
  Box,
  Typography,
  Divider,
  Stack,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  Autocomplete,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Chip,
  Paper,
} from "@mui/material";
import React from "react";
import {useForm, SubmitHandler, Controller} from "react-hook-form";
import useSubmitTransaction from "../../../../api/hooks/useSubmitTransaction";
import {useModulesPathParams} from "./Tabs";
import {
  useNetworkName,
  useAptosClient,
  useSdkV2Client,
} from "../../../../global-config/GlobalConfig";
import {view} from "../../../../api";
import {Link, useNavigate} from "../../../../routing";
import {Code} from "../../Components/CodeSnippet";
import {
  PackageMetadata,
  useGetAccountPackages,
} from "../../../../api/hooks/useGetAccountResource";
import {useLogEventWithBasic} from "../../hooks/useLogEventWithBasic";
import {
  ContentCopy,
  ExpandMore,
  ExpandLess,
  Search,
  HelpOutline,
  CheckCircle,
  Error as ErrorIcon,
  OpenInNew,
} from "@mui/icons-material";
import StyledTooltip from "../../../../components/StyledTooltip";
import {
  encodeInputArgsForViewRequest,
  sortPetraFirst,
  transformCode,
  extractFunctionParamNames,
  extractFunctionTypeParamNames,
} from "../../../../utils";
import {accountPagePath} from "../../Index";
import {Aptos, Hex, parseTypeTag} from "@aptos-labs/ts-sdk";

/**
 * Check if a string looks like an ANS name (ends with .apt)
 */
function isAnsName(value: string): boolean {
  return value.trim().endsWith(".apt");
}

/**
 * Check if a string is a valid hex string (with or without 0x prefix)
 */
function isHexString(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.startsWith("0x")) {
    return /^0x[0-9a-fA-F]*$/.test(trimmed);
  }
  return /^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0;
}

/**
 * Convert a hex string to a Uint8Array.
 */
function hexToBytes(hexString: string): Uint8Array {
  const trimmed = hexString.trim();
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return Hex.fromHexString(hex).toUint8Array();
}

/**
 * Resolve an ANS name to an address using the SDK v2 client.
 */
async function resolveAnsName(
  name: string,
  sdkV2Client: Aptos,
): Promise<string> {
  const ansName = await sdkV2Client.getName({name});
  const address = ansName?.registered_address ?? ansName?.owner_address;
  if (!address) {
    throw new Error(`Failed to resolve ANS name: ${name}`);
  }
  return address;
}

/**
 * Process a single argument value, resolving ANS names if needed.
 */
async function resolveAnsInArgument(
  arg: string | null | undefined,
  type: string,
  sdkV2Client: Aptos,
): Promise<string> {
  if (typeof arg !== "string" || !arg.trim()) {
    return arg ?? "";
  }

  const trimmedArg = arg.trim();
  const typeTag = parseTypeTag(type, {allowGenerics: true});

  if (typeTag.isVector()) {
    const innerTag = typeTag.value;
    if (innerTag.isAddress()) {
      let items: string[];
      if (trimmedArg.startsWith("[")) {
        try {
          items = JSON.parse(trimmedArg) as string[];
        } catch (error) {
          const message =
            "Invalid JSON array format for address vector argument. " +
            "Please provide a valid JSON array of addresses, e.g., " +
            '["addr1", "addr2"].';
          throw new Error(
            error instanceof Error ? `${message} ${error.message}` : message,
          );
        }
      } else {
        items = trimmedArg.split(",").map((item) => item.trim());
      }

      const resolvedItems = await Promise.all(
        items.map(async (item) => {
          if (isAnsName(item)) {
            return resolveAnsName(item, sdkV2Client);
          }
          return item;
        }),
      );

      if (trimmedArg.startsWith("[")) {
        return JSON.stringify(resolvedItems);
      }
      return resolvedItems.join(", ");
    }
    return trimmedArg;
  }

  if (typeTag.isStruct() && typeTag.isOption()) {
    const innerType = typeTag.value.typeArgs[0];
    if (innerType.isAddress() && isAnsName(trimmedArg)) {
      return resolveAnsName(trimmedArg, sdkV2Client);
    }
    return trimmedArg;
  }

  if (typeTag.isAddress() && isAnsName(trimmedArg)) {
    return resolveAnsName(trimmedArg, sdkV2Client);
  }

  return trimmedArg;
}

/**
 * Process all arguments, resolving any ANS names in address-type parameters.
 */
async function resolveAnsInArguments(
  args: (string | undefined)[],
  paramTypes: string[],
  sdkV2Client: Aptos,
): Promise<string[]> {
  return Promise.all(
    args.map((arg, i) => resolveAnsInArgument(arg, paramTypes[i], sdkV2Client)),
  );
}

type ContractFormType = {
  typeArgs: string[];
  args: string[];
  ledgerVersion?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if ("message" in errorObj && typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }
  return "Unknown error";
}

/** Get a user-friendly type name */
function getFriendlyTypeName(type: string): string {
  // Simplify common types
  if (type === "address") return "Address";
  if (type === "bool") return "Boolean";
  if (type === "u8") return "Number (u8)";
  if (type === "u16") return "Number (u16)";
  if (type === "u32") return "Number (u32)";
  if (type === "u64") return "Number (u64)";
  if (type === "u128") return "Number (u128)";
  if (type === "u256") return "Number (u256)";
  if (type === "0x1::string::String") return "String";
  if (type.startsWith("vector<u8>")) return "Bytes (hex or array)";
  if (type.startsWith("vector<")) {
    const inner = type.slice(7, -1);
    return `Array of ${getFriendlyTypeName(inner)}`;
  }
  if (type.startsWith("0x1::option::Option<")) {
    const inner = type.slice(20, -1);
    return `Optional ${getFriendlyTypeName(inner)}`;
  }
  // Return shortened version for complex types
  if (type.includes("::")) {
    const parts = type.split("::");
    return parts[parts.length - 1];
  }
  return type;
}

/** Get placeholder text for input based on type */
function getPlaceholder(type: string): string {
  if (type === "address") return "0x1 or name.apt";
  if (type === "bool") return "true or false";
  if (type.startsWith("u")) return "0";
  if (type === "0x1::string::String") return "Enter text...";
  if (type === "vector<u8>") return "0xDEADBEEF or [222, 173, 190, 239]";
  if (type.startsWith("vector<address>")) return '0x1, 0x2 or ["0x1", "0x2"]';
  if (type.startsWith("vector<"))
    return 'value1, value2 or ["value1", "value2"]';
  if (type.startsWith("0x1::option::Option<")) return "Leave empty for none";
  return "";
}

interface ContractSidebarProps {
  selectedModuleName: string | undefined;
  selectedFnName: string | undefined;
  moduleAndFnsGroup: Record<string, Types.MoveFunction[]>;
  getLinkToFn(moduleName: string, fnName: string, isObject: boolean): string;
  isObject: boolean;
}

function Contract({
  address,
  isObject,
  isRead,
}: {
  address: string;
  isObject: boolean;
  isRead: boolean;
}) {
  const theme = useTheme();
  const {data, isLoading, error} = useGetAccountModules(address);

  // Get selected module and function from path params
  const {selectedModuleName, selectedFnName} = useModulesPathParams();

  const sortedPackages: PackageMetadata[] = useGetAccountPackages(address);
  const modules = useMemo(() => data ?? [], [data]);

  const moduleAndFnsGroup = useMemo(
    () =>
      modules.reduce(
        (acc, module) => {
          if (!module.abi) {
            return acc;
          }

          const fns = module.abi.exposed_functions.filter((fn) =>
            isRead ? fn.is_view : fn.is_entry,
          );
          if (fns.length === 0) {
            return acc;
          }

          const moduleName = module.abi.name;
          return {
            ...acc,
            [moduleName]: fns,
          } as Record<string, Types.MoveFunction[]>;
        },
        {} as Record<string, Types.MoveFunction[]>,
      ),
    [modules, isRead],
  );

  const selectedModule = sortedPackages
    .flatMap((pkg) => pkg.modules)
    .find((module) => module.name === selectedModuleName);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorPage address={address} error={error} />;
  }

  if (modules.length === 0) {
    return <EmptyTabContent />;
  }

  const module = modules.find((m) => m.abi?.name === selectedModuleName)?.abi;
  const fn = selectedModuleName
    ? moduleAndFnsGroup[selectedModuleName]?.find(
        (fn) => fn.name === selectedFnName,
      )
    : undefined;

  function getLinkToFn(moduleName: string, fnName: string, isObject: boolean) {
    const modulesTabValue = isRead ? "view" : "run";
    return `/${accountPagePath(isObject)}/${address}/modules/${modulesTabValue}/${moduleName}/${fnName}`;
  }

  const contractFormKey = module?.name + ":" + fn?.name;
  const totalFunctions = Object.values(moduleAndFnsGroup).flat().length;

  return (
    <Grid container spacing={2}>
      <Grid size={{md: 3, xs: 12}}>
        <ContractSidebar
          selectedModuleName={selectedModuleName}
          selectedFnName={selectedFnName}
          moduleAndFnsGroup={moduleAndFnsGroup}
          getLinkToFn={getLinkToFn}
          isObject={isObject}
        />
      </Grid>
      <Grid size={{md: 9, xs: 12}}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
          }}
        >
          {!module || !fn ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a function to {isRead ? "view" : "run"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalFunctions} {isRead ? "view" : "entry"} function
                {totalFunctions !== 1 ? "s" : ""} available
              </Typography>
            </Box>
          ) : isRead ? (
            <ReadContractForm
              module={module}
              fn={fn}
              sourceCode={selectedModule?.source}
              key={contractFormKey}
            />
          ) : (
            <RunContractForm
              module={module}
              fn={fn}
              sourceCode={selectedModule?.source}
              key={contractFormKey}
            />
          )}

          {module && fn && selectedModule && (
            <>
              <Divider sx={{my: 3}} />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Source Code
                </Typography>
                <Code bytecode={selectedModule?.source} />
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

function ContractSidebar({
  selectedModuleName,
  selectedFnName,
  moduleAndFnsGroup,
  getLinkToFn,
  isObject,
}: ContractSidebarProps) {
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up("md"));
  const logEvent = useLogEventWithBasic();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const flattedFns = useMemo(
    () =>
      Object.entries(moduleAndFnsGroup).flatMap(([moduleName, fns]) =>
        fns
          .map((fn) => ({
            moduleName,
            fnName: fn.name,
            fn,
          }))
          .sort((a, b) => a.fnName.localeCompare(b.fnName)),
      ),
    [moduleAndFnsGroup],
  );

  // Filter functions based on search query
  const filteredModuleAndFns = useMemo(() => {
    if (!searchQuery.trim()) return moduleAndFnsGroup;

    const query = searchQuery.toLowerCase();
    const result: Record<string, Types.MoveFunction[]> = {};

    Object.entries(moduleAndFnsGroup).forEach(([moduleName, fns]) => {
      const matchingFns = fns.filter(
        (fn) =>
          fn.name.toLowerCase().includes(query) ||
          moduleName.toLowerCase().includes(query),
      );
      if (matchingFns.length > 0) {
        result[moduleName] = matchingFns;
      }
    });

    return result;
  }, [moduleAndFnsGroup, searchQuery]);

  const totalCount = flattedFns.length;
  const filteredCount = Object.values(filteredModuleAndFns).flat().length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        maxHeight: "80vh",
        overflowY: "auto",
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      {isWideScreen ? (
        <>
          <TextField
            size="small"
            fullWidth
            placeholder="Search functions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{mb: 2}}
          />

          {searchQuery && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{display: "block", mb: 2}}
            >
              {filteredCount} of {totalCount} functions
            </Typography>
          )}

          <Box>
            {Object.entries(filteredModuleAndFns)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([moduleName, fns]) => (
                <Box key={moduleName} mb={2}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {moduleName}
                  </Typography>
                  <Box>
                    {fns.map((fn) => {
                      const selected =
                        moduleName === selectedModuleName &&
                        fn.name === selectedFnName;
                      return (
                        <SidebarItem
                          key={fn.name}
                          linkTo={getLinkToFn(moduleName, fn.name, isObject)}
                          selected={selected}
                          name={fn.name}
                          loggingInfo={{
                            eventName: "function_name_clicked",
                            value: fn.name,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}

            {Object.keys(filteredModuleAndFns).length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                py={4}
              >
                No functions match "{searchQuery}"
              </Typography>
            )}
          </Box>
        </>
      ) : (
        <Autocomplete
          fullWidth
          options={flattedFns}
          groupBy={(option) => option.moduleName}
          getOptionLabel={(option) => option.fnName}
          renderInput={(params) => (
            <TextField {...params} label="Select a function" size="small" />
          )}
          onChange={(_, fn) => {
            if (fn) {
              logEvent("function_name_clicked", fn.fnName);
              navigate({to: getLinkToFn(fn.moduleName, fn.fnName, isObject)});
            }
          }}
          value={
            selectedModuleName && selectedFnName
              ? flattedFns.find(
                  (fn) =>
                    fn.moduleName === selectedModuleName &&
                    fn.fnName === selectedFnName,
                )
              : null
          }
        />
      )}
    </Paper>
  );
}

function RunContractForm({
  module,
  fn,
  sourceCode,
}: {
  module: Types.MoveModule;
  fn: Types.MoveFunction;
  sourceCode?: string;
}) {
  const networkName = useNetworkName();
  const sdkV2Client = useSdkV2Client();
  const {connected} = useWallet();
  const logEvent = useLogEventWithBasic();
  const [formValid, setFormValid] = useState(false);
  const [ansError, setAnsError] = useState<string | undefined>();
  const {submitTransaction, transactionResponse, transactionInProcess} =
    useSubmitTransaction();

  const fnParams = removeSignerParam(fn);

  const convertArgument = (
    arg: string | null | undefined,
    type: string,
  ): Types.MoveValue => {
    if (typeof arg !== "string") {
      arg = "";
    }
    arg = arg.trim();
    const typeTag = parseTypeTag(type, {allowGenerics: true});
    if (typeTag.isVector()) {
      const innerTag = typeTag.value;
      if (innerTag.isVector()) {
        return JSON.parse(arg) as Types.MoveValue[];
      }

      if (innerTag.isU8()) {
        if (isHexString(arg)) {
          return hexToBytes(arg);
        }
      }

      if (arg.startsWith("[")) {
        return JSON.parse(arg) as Types.MoveValue[];
      } else {
        return arg.split(",").map((arg) => {
          return arg.trim();
        }) as Types.MoveValue[];
      }
    } else if (typeTag.isStruct()) {
      if (typeTag.isOption()) {
        if (arg === "") {
          return undefined as unknown as Types.MoveValue;
        } else {
          const converted = convertArgument(
            arg,
            typeTag.value.typeArgs[0].toString(),
          );
          return converted;
        }
      }
    }

    return arg;
  };

  const onSubmit: SubmitHandler<ContractFormType> = async (data) => {
    logEvent("write_button_clicked", fn.name);
    setAnsError(undefined);

    let resolvedArgs: string[];
    try {
      resolvedArgs = await resolveAnsInArguments(
        data.args,
        fnParams,
        sdkV2Client,
      );
    } catch (e: unknown) {
      const errorMsg =
        e instanceof Error ? e.message : "Failed to resolve ANS name";
      setAnsError(errorMsg);
      return;
    }

    const payload: InputTransactionData = {
      data: {
        function: `${module.address}::${module.name}::${fn.name}`,
        typeArguments: data.typeArgs,
        functionArguments: resolvedArgs.map((arg, i) => {
          const type = fnParams[i];
          return convertArgument(arg, type) as unknown as
            | string
            | number
            | boolean
            | Uint8Array
            | (string | number | boolean | Uint8Array)[];
        }),
      },
    };

    await submitTransaction(payload);
    if (transactionResponse?.transactionSubmitted) {
      logEvent("function_interacted", fn.name, {
        txn_status: transactionResponse.success ? "success" : "failed",
      });
    }
  };

  const isFunctionSuccess = !!(
    transactionResponse?.transactionSubmitted && transactionResponse?.success
  );

  return (
    <ContractForm
      module={module}
      fn={fn}
      onSubmit={onSubmit}
      setFormValid={setFormValid}
      isView={false}
      sourceCode={sourceCode}
      result={
        connected ? (
          <Box>
            <Button
              type="submit"
              disabled={transactionInProcess || !formValid}
              variant="contained"
              size="large"
              sx={{
                minWidth: 140,
                height: 48,
                fontWeight: 600,
              }}
            >
              {transactionInProcess ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Execute"
              )}
            </Button>

            {!formValid && !transactionInProcess && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{display: "block", mt: 1}}
              >
                Fill in all required fields to execute
              </Typography>
            )}

            {ansError && (
              <ResultCard success={false} sx={{mt: 3}}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <ErrorIcon color="error" fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" color="error">
                      ANS Resolution Error
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ansError}
                    </Typography>
                  </Box>
                </Stack>
              </ResultCard>
            )}

            {!transactionInProcess && transactionResponse && !ansError && (
              <ResultCard success={isFunctionSuccess} sx={{mt: 3}}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  {isFunctionSuccess ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <ErrorIcon color="error" fontSize="small" />
                  )}
                  <Box flex={1}>
                    <Typography
                      variant="subtitle2"
                      color={isFunctionSuccess ? "success.main" : "error"}
                    >
                      {isFunctionSuccess
                        ? "Transaction Successful"
                        : "Transaction Failed"}
                    </Typography>

                    {!isFunctionSuccess && transactionResponse.message && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{mt: 0.5}}
                      >
                        {transactionResponse.message}
                      </Typography>
                    )}

                    {transactionResponse.transactionSubmitted &&
                      transactionResponse.transactionHash && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{mt: 1}}
                        >
                          <Typography
                            variant="body2"
                            fontFamily="monospace"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {transactionResponse.transactionHash.slice(0, 20)}
                            ...
                          </Typography>
                          <Link
                            to={`/txn/${transactionResponse.transactionHash}/userTxnOverview`}
                            color="primary"
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              endIcon={<OpenInNew fontSize="small" />}
                            >
                              View
                            </Button>
                          </Link>
                        </Stack>
                      )}
                  </Box>
                </Stack>
              </ResultCard>
            )}
          </Box>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <WalletConnector
              networkSupport={networkName}
              sortInstallableWallets={sortPetraFirst}
              modalMaxWidth="sm"
            />
            <Typography variant="body2" color="text.secondary">
              Connect wallet to execute transactions
            </Typography>
          </Stack>
        )
      }
    />
  );
}

const TOOLTIP_TIME = 2000;

function ReadContractForm({
  module,
  fn,
  sourceCode,
}: {
  module: Types.MoveModule;
  fn: Types.MoveFunction;
  sourceCode?: string;
}) {
  const aptosClient = useAptosClient();
  const sdkV2Client = useSdkV2Client();
  const [result, setResult] = useState<Types.MoveValue[]>();
  const [errMsg, setErrMsg] = useState<string>();
  const [inProcess, setInProcess] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const logEvent = useLogEventWithBasic();
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const resultString =
    result
      ?.map((r) => (typeof r === "string" ? r : JSON.stringify(r, null, 2)))
      .join("\n") ?? "";

  async function copyValue() {
    logEvent("copy_value_button_clicked", fn.name, {
      value: resultString,
      txn_status: "success",
    });
    await navigator.clipboard.writeText(resultString);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  const onSubmit: SubmitHandler<ContractFormType> = async (data) => {
    logEvent("read_button_clicked", fn.name);
    setErrMsg(undefined);
    setResult(undefined);

    let resolvedArgs: string[];
    try {
      resolvedArgs = await resolveAnsInArguments(
        data.args,
        fn.params,
        sdkV2Client,
      );
    } catch (e: unknown) {
      const errorMsg =
        e instanceof Error ? e.message : "Failed to resolve ANS name";
      setErrMsg("ANS Resolution Error: " + errorMsg);
      return;
    }

    let viewRequest: Types.ViewRequest;
    try {
      viewRequest = {
        function: `${module.address}::${module.name}::${fn.name}`,
        type_arguments: data.typeArgs,
        arguments: resolvedArgs.map((arg, i) => {
          return encodeInputArgsForViewRequest(fn.params[i], arg);
        }),
      };
    } catch (e: unknown) {
      setErrMsg("Parsing arguments failed: " + getErrorMessage(e));
      return;
    }
    setInProcess(true);
    try {
      const result = await view(viewRequest, aptosClient, data.ledgerVersion);
      setResult(result);
      setErrMsg(undefined);
      logEvent("function_interacted", fn.name, {txn_status: "success"});
    } catch (e: unknown) {
      let error = getErrorMessage(e);
      const prefix = "Error:";
      if (error.startsWith(prefix)) {
        error = error.substring(prefix.length).trim();
      }
      setErrMsg(error);
      setResult(undefined);
      logEvent("function_interacted", fn.name, {txn_status: "failed"});
    }
    setInProcess(false);
  };

  return (
    <ContractForm
      module={module}
      fn={fn}
      onSubmit={onSubmit}
      setFormValid={setFormValid}
      isView={true}
      sourceCode={sourceCode}
      result={
        <Box>
          <Button
            type="submit"
            disabled={inProcess || !formValid}
            variant="contained"
            size="large"
            sx={{
              minWidth: 140,
              height: 48,
              fontWeight: 600,
            }}
          >
            {inProcess ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Query"
            )}
          </Button>

          {!formValid && !inProcess && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{display: "block", mt: 1}}
            >
              Fill in all required fields to query
            </Typography>
          )}

          {!inProcess && (errMsg || result) && (
            <ResultCard success={!errMsg} sx={{mt: 3}}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box flex={1} overflow="auto" maxHeight={400}>
                  {errMsg ? (
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <ErrorIcon color="error" fontSize="small" />
                      <Box>
                        <Typography variant="subtitle2" color="error">
                          Error
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {errMsg}
                        </Typography>
                      </Box>
                    </Stack>
                  ) : (
                    <>
                      <Typography
                        variant="subtitle2"
                        color="success.main"
                        gutterBottom
                      >
                        Result
                      </Typography>
                      <Typography
                        component="pre"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          m: 0,
                          p: 1.5,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        {resultString}
                      </Typography>
                    </>
                  )}
                </Box>

                {!errMsg && result && (
                  <StyledTooltip
                    title="Copied!"
                    placement="top"
                    open={tooltipOpen}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton onClick={copyValue} size="small">
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </StyledTooltip>
                )}
              </Stack>
            </ResultCard>
          )}
        </Box>
      }
    />
  );
}

function ResultCard({
  success,
  children,
  sx,
}: {
  success: boolean;
  children: React.ReactNode;
  sx?: object;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: success ? "success.main" : "error.main",
        bgcolor:
          theme.palette.mode === "dark"
            ? success
              ? "rgba(46, 125, 50, 0.1)"
              : "rgba(211, 47, 47, 0.1)"
            : success
              ? "rgba(46, 125, 50, 0.05)"
              : "rgba(211, 47, 47, 0.05)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function HelpSection() {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const helpItems = [
    {
      title: "ANS Names",
      desc: "Use .apt names for addresses (e.g., gregnazario.apt)",
    },
    {
      title: "Bytes (vector<u8>)",
      desc: "Use hex (0xDEADBEEF) or array ([222, 173, 190, 239])",
    },
    {
      title: "Optional Values",
      desc: "Leave empty for Option::none",
    },
    {
      title: "Arrays",
      desc: 'Use JSON ["a", "b"] or comma-separated: a, b',
    },
    {
      title: "Nested Arrays",
      desc: "Must use JSON format",
    },
  ];

  return (
    <Box sx={{mt: 3}}>
      <Button
        size="small"
        startIcon={<HelpOutline fontSize="small" />}
        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
        onClick={() => setExpanded(!expanded)}
        sx={{
          color: "text.secondary",
          textTransform: "none",
        }}
      >
        Input format help
      </Button>
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 1,
            p: 2,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.02)",
            borderRadius: 1,
          }}
        >
          <Stack spacing={1}>
            {helpItems.map((item, i) => (
              <Box key={i}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.primary"
                >
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" ml={1}>
                  — {item.desc}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

function ContractForm({
  module,
  fn,
  onSubmit,
  setFormValid,
  result,
  isView,
  sourceCode,
}: {
  module: Types.MoveModule;
  fn: Types.MoveFunction;
  onSubmit: SubmitHandler<ContractFormType>;
  setFormValid: (valid: boolean) => void;
  result: ReactNode;
  isView: boolean;
  sourceCode?: string;
}) {
  const {account} = useWallet();
  const theme = useTheme();
  const [fnCopyTooltipOpen, setFnCopyTooltipOpen] = useState(false);
  const {
    handleSubmit,
    control,
    formState: {isValid},
  } = useForm<ContractFormType>({
    mode: "all",
    defaultValues: {
      typeArgs: [],
      args: [],
    },
  });

  const fnParams = removeSignerParam(fn);
  const hasSigner = fnParams.length !== fn.params.length;

  const fullFunctionId = `${module.address}::${module.name}::${fn.name}`;

  async function copyFullFunctionId() {
    await navigator.clipboard.writeText(fullFunctionId);
    setFnCopyTooltipOpen(true);
    setTimeout(() => {
      setFnCopyTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  // Extract parameter names from source code if available
  const paramNames = useMemo(() => {
    if (!sourceCode) return null;
    const decodedSource = transformCode(sourceCode);
    if (!decodedSource) return null;
    const names = extractFunctionParamNames(decodedSource, fn.name);
    // If we have a signer param that was removed, also remove it from extracted names
    if (names && hasSigner) {
      return names.slice(1);
    }
    return names;
  }, [sourceCode, fn.name, hasSigner]);

  // Extract type parameter names from source code if available
  const typeParamNames = useMemo(() => {
    if (!sourceCode) return null;
    const decodedSource = transformCode(sourceCode);
    if (!decodedSource) return null;
    return extractFunctionTypeParamNames(decodedSource, fn.name);
  }, [sourceCode, fn.name]);

  useEffect(() => {
    setFormValid(isValid);
  }, [isValid, setFormValid]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box>
        {/* Function Header */}
        <Box mb={3}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight={600}>
              {fn.name}
            </Typography>
            <StyledTooltip
              title={
                fnCopyTooltipOpen ? "Copied!" : "Copy full function identifier"
              }
              placement="top"
              open={fnCopyTooltipOpen || undefined}
              disableFocusListener={fnCopyTooltipOpen}
              disableHoverListener={fnCopyTooltipOpen}
              disableTouchListener={fnCopyTooltipOpen}
            >
              <IconButton onClick={copyFullFunctionId} size="small">
                <ContentCopy fontSize="small" />
              </IconButton>
            </StyledTooltip>
            <Chip
              label={isView ? "View" : "Entry"}
              size="small"
              color={isView ? "info" : "primary"}
              variant="outlined"
            />
          </Stack>

          {/* Function Signature */}
          <Box
            sx={{
              p: 1.5,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: 13,
              overflow: "auto",
            }}
          >
            <Typography component="span" color="primary.main" fontWeight={600}>
              {fn.name}
            </Typography>
            {fn.generic_type_params.length > 0 && (
              <Typography component="span" color="text.secondary">
                {"<"}
                {fn.generic_type_params
                  .map((_, i) => typeParamNames?.[i] ?? `T${i}`)
                  .join(", ")}
                {">"}
              </Typography>
            )}
            <Typography component="span" color="text.secondary">
              (
            </Typography>
            {fn.params.length > 0 && (
              <Box component="span">
                {fn.params.map((param, i) => {
                  // Get the full param names (without signer removal) for display
                  const fullParamNames = sourceCode
                    ? extractFunctionParamNames(
                        transformCode(sourceCode),
                        fn.name,
                      )
                    : null;
                  const paramName = fullParamNames?.[i];
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && (
                        <Typography component="span" color="text.secondary">
                          ,{" "}
                        </Typography>
                      )}
                      {paramName && (
                        <Typography component="span" color="info.main">
                          {paramName}:{" "}
                        </Typography>
                      )}
                      <Typography component="span" color="warning.main">
                        {param}
                      </Typography>
                    </React.Fragment>
                  );
                })}
              </Box>
            )}
            <Typography component="span" color="text.secondary">
              )
            </Typography>
            {fn.return.length > 0 && (
              <>
                <Typography component="span" color="text.secondary">
                  {" → "}
                </Typography>
                <Typography component="span" color="success.main">
                  {fn.return.join(", ")}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{mb: 3}} />

        {/* Form Fields */}
        <Stack spacing={3}>
          {/* Type Arguments */}
          {fn.generic_type_params.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Type Arguments
              </Typography>
              <Stack spacing={2}>
                {fn.generic_type_params.map((_, i) => {
                  const typeParamName = typeParamNames?.[i] ?? `T${i}`;
                  return (
                    <Controller
                      key={i}
                      name={`typeArgs.${i}`}
                      control={control}
                      rules={{required: true}}
                      render={({field: {onChange, value}}) => (
                        <TextField
                          onChange={onChange}
                          value={value ?? ""}
                          label={typeParamName}
                          placeholder="0x1::module::Type"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Function Arguments */}
          {(hasSigner || fnParams.length > 0) && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Arguments
              </Typography>
              <Stack spacing={2}>
                {hasSigner && (
                  <TextField
                    value={account?.address ?? ""}
                    label="signer (your wallet)"
                    disabled
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {fontFamily: "monospace", fontSize: 13},
                    }}
                  />
                )}
                {fnParams.map((param, i) => {
                  const isOption = param.startsWith("0x1::option::Option");
                  const friendlyName = getFriendlyTypeName(param);
                  const placeholder = getPlaceholder(param);
                  // Use extracted param name if available, otherwise fall back to friendly type name
                  const argName = paramNames?.[i];
                  const displayLabel = argName
                    ? `${argName} (${friendlyName})`
                    : friendlyName;

                  return (
                    <Controller
                      key={`args-${i}`}
                      name={`args.${i}`}
                      control={control}
                      rules={{required: !isOption}}
                      render={({field: {onChange, value}}) => (
                        <TextField
                          onChange={onChange}
                          value={isOption ? value : (value ?? "")}
                          label={displayLabel}
                          placeholder={placeholder}
                          fullWidth
                          size="small"
                          InputLabelProps={{shrink: true}}
                          helperText={
                            <Typography
                              component="span"
                              variant="caption"
                              fontFamily="monospace"
                              color="text.secondary"
                            >
                              {param}
                            </Typography>
                          }
                          InputProps={{
                            endAdornment: isOption ? (
                              <InputAdornment position="end">
                                <Chip
                                  label="optional"
                                  size="small"
                                  variant="outlined"
                                  sx={{height: 20, fontSize: 10}}
                                />
                              </InputAdornment>
                            ) : undefined,
                          }}
                        />
                      )}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Ledger Version for View */}
          {isView && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Options
              </Typography>
              <Controller
                name="ledgerVersion"
                control={control}
                rules={{required: false}}
                render={({field: {onChange, value}}) => (
                  <TextField
                    onChange={onChange}
                    value={value ?? ""}
                    label="Ledger Version"
                    placeholder="Leave empty for latest"
                    fullWidth
                    size="small"
                    helperText="Query at a specific blockchain version"
                  />
                )}
              />
            </Box>
          )}

          {/* Submit Button & Results */}
          <Box>{result}</Box>
        </Stack>

        <HelpSection />
      </Box>
    </form>
  );
}

function removeSignerParam(fn: Types.MoveFunction) {
  return fn.params.filter((p) => p !== "signer" && p !== "&signer");
}

export default Contract;
