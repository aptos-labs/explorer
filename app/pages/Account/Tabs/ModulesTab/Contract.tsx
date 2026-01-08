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
  Alert,
  CircularProgress,
} from "@mui/material";
import React from "react";
import {useForm, SubmitHandler, Controller} from "react-hook-form";
import {useSearch} from "../../../../routing";
import useSubmitTransaction from "../../../../api/hooks/useSubmitTransaction";
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
import {ContentCopy} from "@mui/icons-material";
import StyledTooltip from "../../../../components/StyledTooltip";
import {encodeInputArgsForViewRequest, sortPetraFirst} from "../../../../utils";
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
  // Check for 0x prefix first
  if (trimmed.startsWith("0x")) {
    return /^0x[0-9a-fA-F]*$/.test(trimmed);
  }
  // Also accept plain hex without prefix if it looks like hex (all hex chars, even length)
  return /^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0;
}

/**
 * Convert a hex string to a Uint8Array.
 * Accepts both 0x-prefixed and non-prefixed hex strings.
 */
function hexToBytes(hexString: string): Uint8Array {
  const trimmed = hexString.trim();
  // Use the SDK's Hex class for proper conversion
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return Hex.fromHexString(hex).toUint8Array();
}

/**
 * Resolve an ANS name to an address using the SDK v2 client.
 * Throws an error if the name cannot be resolved.
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
 * For address types, if the value looks like an ANS name (.apt), resolve it.
 * Throws an error if ANS resolution fails.
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

  // Handle vector types - check inner elements for address type
  if (typeTag.isVector()) {
    const innerTag = typeTag.value;
    if (innerTag.isAddress()) {
      // Parse as array and resolve each ANS name
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

      // Return in the same format as input
      if (trimmedArg.startsWith("[")) {
        return JSON.stringify(resolvedItems);
      }
      return resolvedItems.join(", ");
    }
    // For non-address vectors, return as-is
    return trimmedArg;
  }

  // Handle Option<address> type
  if (typeTag.isStruct() && typeTag.isOption()) {
    const innerType = typeTag.value.typeArgs[0];
    if (innerType.isAddress() && isAnsName(trimmedArg)) {
      return resolveAnsName(trimmedArg, sdkV2Client);
    }
    return trimmedArg;
  }

  // Handle direct address type
  if (typeTag.isAddress() && isAnsName(trimmedArg)) {
    return resolveAnsName(trimmedArg, sdkV2Client);
  }

  return trimmedArg;
}

/**
 * Process all arguments, resolving any ANS names in address-type parameters.
 * Throws an error if any ANS resolution fails.
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

// Helper function to extract error message safely
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return (error as Error).message;
  }
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if ("message" in errorObj && typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }
  return "Unknown error";
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
  const search = useSearch({strict: false}) as {
    selectedModuleName?: string;
    selectedFnName?: string;
  };
  const selectedModuleName = search?.selectedModuleName;
  const selectedFnName = search?.selectedFnName;
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
    return null;
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
    // Using search params for module/function selection within the modules tab path
    const modulesTabValue = isRead ? "view" : "run";
    return `/${accountPagePath(isObject)}/${address}/modules?modulesTab=${modulesTabValue}&selectedModuleName=${moduleName}&selectedFnName=${fnName}`;
  }

  // Use this key to force re-mount the Form component when the fn changes,
  // so that the state of the form is reset.
  const contractFormKey = module?.name + ":" + fn?.name;
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
        <Box
          padding={4}
          bgcolor={theme.palette.background.paper}
          borderRadius={1}
        >
          {!module || !fn ? (
            <Typography>Please select a function</Typography>
          ) : isRead ? (
            <ReadContractForm module={module} fn={fn} key={contractFormKey} />
          ) : (
            <RunContractForm module={module} fn={fn} key={contractFormKey} />
          )}

          {module && fn && selectedModule && (
            <>
              <Divider sx={{margin: "24px 0"}} />
              <Code bytecode={selectedModule?.source} />
            </>
          )}
        </Box>
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
  const flattedFns = useMemo(
    () =>
      Object.entries(moduleAndFnsGroup).flatMap(([moduleName, fns]) =>
        fns
          .map((fn) => ({
            moduleName,
            fnName: fn.name,
          }))
          .sort((a, b) => a.fnName[0].localeCompare(b.fnName[0])),
      ),
    [moduleAndFnsGroup],
  );

  return (
    <Box
      sx={{padding: "24px", maxHeight: "100vh", overflowY: "auto"}}
      bgcolor={theme.palette.background.paper}
      borderRadius={1}
    >
      {isWideScreen ? (
        <>
          <Typography fontSize={16} fontWeight={500} marginBottom={"24px"}>
            Select function
          </Typography>
          <Box>
            {Object.entries(moduleAndFnsGroup)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([moduleName, fns]) => (
                <Box key={moduleName} marginBottom={3}>
                  <Typography
                    fontSize={15}
                    fontWeight={600}
                    marginBottom={"8px"}
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
                    <Divider sx={{marginTop: "24px"}} />
                  </Box>
                </Box>
              ))}
          </Box>
        </>
      ) : (
        <Autocomplete
          fullWidth
          options={flattedFns}
          groupBy={(option) => option.moduleName}
          getOptionLabel={(option) => option.fnName}
          renderInput={(params) => (
            <TextField {...params} label="Select a function" />
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
    </Box>
  );
}

function RunContractForm({
  module,
  fn,
}: {
  module: Types.MoveModule;
  fn: Types.MoveFunction;
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

  // TODO: We should use the SDKv2 for this
  // Note: Return type uses Types.MoveValue which is the union type for all Move values
  // The actual type depends on the Move type being converted at runtime
  const convertArgument = (
    arg: string | null | undefined,
    type: string,
  ): Types.MoveValue => {
    // TypeScript doesn't really protect us from nulls, this enforces it
    if (typeof arg !== "string") {
      arg = "";
    }
    arg = arg.trim();
    const typeTag = parseTypeTag(type, {allowGenerics: true});
    if (typeTag.isVector()) {
      const innerTag = typeTag.value;
      if (innerTag.isVector()) {
        // This must be JSON, let's parse it
        return JSON.parse(arg) as Types.MoveValue[];
      }

      if (innerTag.isU8()) {
        // For vector<u8>, support both hex strings and byte arrays
        if (isHexString(arg)) {
          // Convert hex string to Uint8Array for proper handling
          return hexToBytes(arg);
        }
      }

      if (arg.startsWith("[")) {
        // This is supposed to be JSON if it has the bracket
        return JSON.parse(arg) as Types.MoveValue[];
      } else {
        // We handle array without brackets otherwise
        return arg.split(",").map((arg) => {
          return arg.trim();
        }) as Types.MoveValue[];
      }
    } else if (typeTag.isStruct()) {
      if (typeTag.isOption()) {
        // This we need to handle if there is no value, we take "empty trimmed" as no value
        if (arg === "") {
          return undefined as unknown as Types.MoveValue;
        } else {
          // Convert for the inner type if it isn't empty
          const converted = convertArgument(
            arg,
            typeTag.value.typeArgs[0].toString(),
          );
          return converted;
        }
      }
    }

    // For all other cases return it straight
    return arg;
  };

  const onSubmit: SubmitHandler<ContractFormType> = async (data) => {
    logEvent("write_button_clicked", fn.name);
    setAnsError(undefined);

    // Resolve any ANS names in arguments before processing
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
          // Convert MoveValue to the expected argument type
          // The wallet adapter will handle the conversion
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
      fn={fn}
      onSubmit={onSubmit}
      setFormValid={setFormValid}
      isView={false}
      result={
        connected ? (
          <Box>
            <StyledTooltip
              title="Input arguments cannot be empty."
              placement="right"
              disableHoverListener={formValid}
            >
              <span>
                <Button
                  type="submit"
                  disabled={transactionInProcess || !formValid}
                  variant="contained"
                  sx={{width: "8rem", height: "3rem"}}
                >
                  {transactionInProcess ? (
                    <CircularProgress size={30}></CircularProgress>
                  ) : (
                    "Run"
                  )}
                </Button>
              </span>
            </StyledTooltip>

            {/* ANS resolution error */}
            {ansError && (
              <ExecutionResult success={false}>
                <Stack
                  direction="row"
                  gap={2}
                  pt={3}
                  justifyContent="space-between"
                >
                  <Stack>
                    <Typography fontSize={12} fontWeight={600} mb={1}>
                      ANS Resolution Error:
                    </Typography>
                    <Typography fontSize={12} fontWeight={400}>
                      {ansError}
                    </Typography>
                  </Stack>
                </Stack>
              </ExecutionResult>
            )}

            {/* Has some execution result to display */}
            {!transactionInProcess && transactionResponse && !ansError && (
              <ExecutionResult success={isFunctionSuccess}>
                <Stack
                  direction="row"
                  gap={2}
                  pt={3}
                  justifyContent="space-between"
                >
                  <Stack>
                    {/* It's failed, display an error */}
                    {!isFunctionSuccess && (
                      <>
                        <Typography fontSize={12} fontWeight={600} mb={1}>
                          Error:
                        </Typography>
                        <Typography fontSize={12} fontWeight={400}>
                          {transactionResponse.message
                            ? transactionResponse.message
                            : "Unknown"}
                        </Typography>
                      </>
                    )}

                    {/* Has a transaction, display the hash */}
                    {transactionResponse.transactionSubmitted &&
                      transactionResponse.transactionHash && (
                        <>
                          <Typography fontSize={12} fontWeight={600} mb={1}>
                            Transaction:
                          </Typography>
                          <Typography fontSize={12} fontWeight={400}>
                            {transactionResponse.transactionHash}
                          </Typography>
                        </>
                      )}
                  </Stack>

                  {/* Has a transaction, display the button to view the transaction */}
                  {transactionResponse.transactionSubmitted &&
                    transactionResponse.transactionHash && (
                      <Link
                        to={`/txn/${transactionResponse.transactionHash}`}
                        color="inherit"
                        target="_blank"
                      >
                        <Button
                          variant="outlined"
                          sx={{
                            height: "2rem",
                            minWidth: "unset",
                            borderRadius: "0.5rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          View Transaction
                        </Button>
                      </Link>
                    )}
                </Stack>
              </ExecutionResult>
            )}
          </Box>
        ) : (
          <Box display="flex" flexDirection="row" alignItems="center">
            <WalletConnector
              networkSupport={networkName}
              sortInstallableWallets={sortPetraFirst}
              modalMaxWidth="sm"
            />
            <Typography ml={2} fontSize={10}>
              To run you need to connect wallet first
            </Typography>
          </Box>
        )
      }
    />
  );
}

const TOOLTIP_TIME = 2000; // 2s
function ReadContractForm({
  module,
  fn,
}: {
  module: Types.MoveModule;
  fn: Types.MoveFunction;
}) {
  const aptosClient = useAptosClient();
  const sdkV2Client = useSdkV2Client();
  const [result, setResult] = useState<Types.MoveValue[]>();
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up("md"));
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

    // Resolve any ANS names in arguments before processing
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
      // Ensure error is a string
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
      fn={fn}
      onSubmit={onSubmit}
      setFormValid={setFormValid}
      isView={true}
      result={
        <Box>
          <StyledTooltip
            title="Input arguments cannot be empty."
            disableHoverListener={formValid}
            placement="right"
          >
            <span>
              <Button
                type="submit"
                disabled={inProcess || !formValid}
                variant="contained"
                sx={{width: "8rem", height: "3rem"}}
              >
                {inProcess ? (
                  <CircularProgress size={30}></CircularProgress>
                ) : (
                  "View"
                )}
              </Button>
            </span>
          </StyledTooltip>
          {!inProcess && (errMsg || result) && (
            <>
              <Divider sx={{margin: "24px 0"}} />
              <Stack
                direction={isWideScreen ? "row" : "column"}
                gap={2}
                mt={2}
                justifyContent="space-between"
              >
                <Box
                  sx={{
                    flex: 1,
                    maxWidth: "100%",
                    overflow: "auto",
                    maxHeight: 400,
                  }}
                >
                  <Typography
                    component="pre"
                    fontSize={12}
                    fontWeight={400}
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      margin: 0,
                      fontFamily: "monospace",
                    }}
                    color={errMsg ? "error" : "inherit"}
                  >
                    {errMsg ? "Error: " + errMsg : resultString}
                  </Typography>
                </Box>

                {!errMsg && (
                  <StyledTooltip
                    title="Value copied"
                    placement="right"
                    open={tooltipOpen}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <Button
                      sx={{
                        height: "2rem",
                        minWidth: "unset",
                        width: "fit-content",
                      }}
                      onClick={copyValue}
                    >
                      <ContentCopy style={{height: "1rem", width: "1.25rem"}} />
                      <Typography
                        marginLeft={1}
                        fontSize={12}
                        sx={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        Copy value
                      </Typography>
                    </Button>
                  </StyledTooltip>
                )}
              </Stack>
            </>
          )}
        </Box>
      }
    />
  );
}

function ExecutionResult({
  success,
  children,
}: {
  success: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Box
      padding={3}
      borderRadius={1}
      bgcolor={
        theme.palette.mode === "dark"
          ? theme.palette.neutralShade.lighter
          : theme.palette.neutralShade.darker
      }
      mt={4}
    >
      <Alert
        severity={success ? "success" : "error"}
        sx={{width: "fit-content", padding: "0rem 1rem"}}
      >
        <Typography fontSize={12}>
          {success ? "Function successfully executed" : "Function failed"}
        </Typography>
      </Alert>
      <Box>{children}</Box>
    </Box>
  );
}

function ContractForm({
  fn,
  onSubmit,
  setFormValid,
  result,
  isView,
}: {
  fn: Types.MoveFunction;
  onSubmit: SubmitHandler<ContractFormType>;
  setFormValid: (valid: boolean) => void;
  result: ReactNode;
  isView: boolean;
}) {
  const {account} = useWallet();
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

  useEffect(() => {
    setFormValid(isValid);
  }, [isValid, setFormValid]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box>
        <Stack spacing={4}>
          <Typography fontSize={15} fontWeight={600}>
            {fn.name}
            {fn.generic_type_params.length > 0 &&
              "<" +
                [...Array(fn.generic_type_params.length)].map(
                  (_, i) => `T${i}`,
                ) +
                ">"}
            ({fn.params.join(", ")})
          </Typography>
          <Stack spacing={4}>
            {[...Array(fn.generic_type_params.length)].map((_, i) => (
              <Controller
                key={i}
                name={`typeArgs.${i}`}
                control={control}
                rules={{required: true}}
                render={({field: {onChange, value}}) => (
                  <TextField
                    onChange={onChange}
                    value={value ?? ""}
                    label={`T${i}`}
                    fullWidth
                  />
                )}
              />
            ))}
            {hasSigner &&
              (account ? (
                <TextField
                  key="args-signer"
                  value={account.address}
                  label="signer"
                  disabled
                  fullWidth
                />
              ) : (
                <TextField label="signer" disabled fullWidth />
              ))}
            {fnParams.map((param, i) => {
              // TODO: Need a nice way to differentiate between option and empty string
              const isOption = param.startsWith("0x1::option::Option");
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
                      label={`arg${i}: ${param}`}
                      fullWidth
                    />
                  )}
                />
              );
            })}
          </Stack>
          {isView && (
            <Stack spacing={4}>
              <Controller
                key={"ledgerVersion"}
                name={"ledgerVersion"}
                control={control}
                rules={{required: false}}
                render={({field: {onChange, value}}) => (
                  <TextField
                    onChange={onChange}
                    value={value}
                    label={"ledgerVersion: defaults to current version"}
                    fullWidth
                  />
                )}
              />
            </Stack>
          )}
          {result}
          {/* TODO: Figure out a better way to show instructions, I tried, and it wasn't pretty */}
          <Typography fontSize={14} fontWeight={600}>
            How to use:
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            ANS names (.apt) are supported for address arguments (e.g.
            gregnazario.apt will resolve to the address)
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            vector&lt;u8&gt; accepts hex strings (e.g. 0xDEADBEEF or DEADBEEF)
            or byte arrays (e.g. [222, 173, 190, 239])
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            Option arguments can be submitted with no value, which would be
            Option::none
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            Nested vectors must be provided in JSON
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            Vector arguments can be provided in JSON or as a comma separated
            list e.g. 0x1, 0x2 or ["0x1", "0x2"]
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            Numbers and booleans must be inputted without quotes if providing
            JSON
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            Signed integers (i8, i16, i32, i64, i128, i256) support negative
            values e.g. -42
          </Typography>
        </Stack>
      </Box>
    </form>
  );
}

function removeSignerParam(fn: Types.MoveFunction) {
  return fn.params.filter((p) => p !== "signer" && p !== "&signer");
}

export default Contract;
