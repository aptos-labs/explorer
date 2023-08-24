import {HexString, Types} from "aptos";
import {ReactNode, useEffect, useMemo, useState} from "react";
import Error from "../../Error";
import {useGetAccountModules} from "../../../../api/hooks/useGetAccountModules";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
import SidebarItem from "../../Components/SidebarItem";
import {WalletConnector} from "@aptos-labs/wallet-adapter-mui-design";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
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
import {useParams} from "react-router-dom";
import useSubmitTransaction from "../../../../api/hooks/useSubmitTransaction";
import {useGlobalState} from "../../../../global-config/GlobalConfig";
import {view} from "../../../../api";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {useNavigate} from "../../../../routing";
import {Code} from "../../Components/CodeSnippet";
import {
  PackageMetadata,
  useGetAccountPackages,
} from "../../../../api/hooks/useGetAccountResource";
import {useLogEventWithBasic} from "../../hooks/useLogEventWithBasic";
import {ContentCopy} from "@mui/icons-material";
import StyledTooltip from "../../../../components/StyledTooltip";
import {
  deserializeVector,
  encodeInputArgsForViewRequest,
} from "../../../../utils";

type ContractFormType = {
  typeArgs: string[];
  args: string[];
};

interface ContractSidebarProps {
  selectedModuleName: string | undefined;
  selectedFnName: string | undefined;
  moduleAndFnsGroup: Record<string, Types.MoveFunction[]>;
  getLinkToFn(moduleName: string, fnName: string): string;
}

function Contract({address, isRead}: {address: string; isRead: boolean}) {
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up("md"));
  const {data, isLoading, error} = useGetAccountModules(address);
  const {selectedModuleName, selectedFnName} = useParams();
  const sortedPackages: PackageMetadata[] = useGetAccountPackages(address);
  const selectedModule = sortedPackages
    .flatMap((pkg) => pkg.modules)
    .find((module) => module.name === selectedModuleName);

  if (!isRead && !isWideScreen) {
    return (
      <Grid item xs={12}>
        <Box
          padding={3}
          bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
          borderRadius={1}
        >
          <Typography
            fontSize={16}
            fontWeight={500}
            marginBottom={"16px"}
            color={theme.palette.mode === "dark" ? grey[300] : grey[600]}
          >
            Unfortunately, we are not supporting <b>Run</b> entry functions on
            mobile at the moment.
          </Typography>

          <Typography
            fontSize={12}
            fontWeight={500}
            color={theme.palette.mode === "dark" ? grey[400] : grey[500]}
          >
            Please, use a laptop or a desktop computer.
          </Typography>
        </Box>
      </Grid>
    );
  }

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

  const moduleAndFnsGroup = modules.reduce(
    (acc, module) => {
      if (module.abi === undefined) {
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
  );

  const module = modules.find((m) => m.abi?.name === selectedModuleName)?.abi;
  const fn = selectedModuleName
    ? moduleAndFnsGroup[selectedModuleName]?.find(
        (fn) => fn.name === selectedFnName,
      )
    : undefined;

  function getLinkToFn(moduleName: string, fnName: string) {
    // This string implicitly depends on the fact that
    // the `isRead` value is determined by the
    // pathname `view` and `run`.
    return `/account/${address}/modules/${
      isRead ? "view" : "run"
    }/${moduleName}/${fnName}`;
  }

  // Use this key to force re-mount the Form component when the fn changes,
  // so that the state of the form is reset.
  const contractFormKey = module?.name + ":" + fn?.name;
  return (
    <Grid container spacing={2}>
      <Grid item md={3} xs={12}>
        <ContractSidebar
          selectedModuleName={selectedModuleName}
          selectedFnName={selectedFnName}
          moduleAndFnsGroup={moduleAndFnsGroup}
          getLinkToFn={getLinkToFn}
        />
      </Grid>
      <Grid item md={9} xs={12}>
        <Box
          padding={4}
          bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
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
}: ContractSidebarProps) {
  const theme = useTheme();
  const isWideScreen = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const logEvent = useLogEventWithBasic();
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
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
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
                    fontSize={14}
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
                          linkTo={getLinkToFn(moduleName, fn.name)}
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
            fn && logEvent("function_name_clicked", fn.fnName);
            fn && navigate(getLinkToFn(fn.moduleName, fn.fnName));
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
  const [state] = useGlobalState();
  const {connected} = useWallet();
  const logEvent = useLogEventWithBasic();
  const [formValid, setFormValid] = useState(false);
  const {submitTransaction, transactionResponse, transactionInProcess} =
    useSubmitTransaction();

  const fnParams = removeSignerParam(fn);

  const onSubmit: SubmitHandler<ContractFormType> = async (data) => {
    logEvent("write_button_clicked", fn.name);
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${module.address}::${module.name}::${fn.name}`,
      type_arguments: data.typeArgs,
      arguments: data.args.map((arg, i) => {
        const type = fnParams[i];
        if (type.includes("vector")) {
          // when it's a vector<u8>, we support both hex and javascript array format
          return type === "vector<u8>" && arg.trim().startsWith("0x")
            ? Array.from(new HexString(arg).toUint8Array()).map((x) =>
                x.toString(),
              )
            : deserializeVector(arg);
        } else if (type.startsWith("0x1::option::Option")) {
          arg ? {vec: [arg]} : undefined;
        } else return arg;
      }),
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

            {/* Has some execution result to display */}
            {!transactionInProcess && transactionResponse && (
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
                      <Button
                        variant="outlined"
                        onClick={() =>
                          window.open(
                            `/txn/${transactionResponse.transactionHash}`,
                            "_blank",
                          )
                        }
                        sx={{
                          height: "2rem",
                          minWidth: "unset",
                          borderRadius: "0.5rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        View Transaction
                      </Button>
                    )}
                </Stack>
              </ExecutionResult>
            )}
          </Box>
        ) : (
          <Box display="flex" flexDirection="row" alignItems="center">
            <WalletConnector networkSupport={state.network_name} />
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
  const [state] = useGlobalState();
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
    let viewRequest: Types.ViewRequest;
    try {
      viewRequest = {
        function: `${module.address}::${module.name}::${fn.name}`,
        type_arguments: data.typeArgs,
        arguments: data.args.map((arg, i) => {
          return encodeInputArgsForViewRequest(fn.params[i], arg);
        }),
      };
    } catch (e: any) {
      setErrMsg("Parse arguments failed: " + e?.message);
      return;
    }
    setInProcess(true);
    try {
      const result = await view(viewRequest, state.network_value);
      setResult(result);
      setErrMsg(undefined);
      logEvent("function_interacted", fn.name, {txn_status: "success"});
    } catch (e: any) {
      let error = e.message ?? String(e);

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
                <Stack>
                  <Typography fontSize={12} fontWeight={400} pl={1} pt="6px">
                    {errMsg ? "Error: " + errMsg : resultString}
                  </Typography>
                </Stack>

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
      bgcolor={theme.palette.mode === "dark" ? grey[700] : grey[200]}
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
}: {
  fn: Types.MoveFunction;
  onSubmit: SubmitHandler<ContractFormType>;
  setFormValid: (valid: boolean) => void;
  result: ReactNode;
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
          <Typography fontSize={14} fontWeight={600}>
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
                      value={isOption ? value : value ?? ""}
                      label={`arg${i}: ${param}`}
                      fullWidth
                    />
                  )}
                />
              );
            })}
          </Stack>
          {result}
        </Stack>
      </Box>
    </form>
  );
}

function removeSignerParam(fn: Types.MoveFunction) {
  return fn.params.filter((p) => p !== "signer" && p !== "&signer");
}

export default Contract;
