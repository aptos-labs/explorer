import {Types} from "aptos";
import {ReactNode, useState} from "react";
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
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import React from "react";
import {useForm, SubmitHandler, Controller} from "react-hook-form";
import {useParams} from "react-router-dom";
import useSubmitTransaction from "../../../../api/hooks/useSubmitTransaction";
import {useGlobalState} from "../../../../global-config/GlobalConfig";
import {view} from "../../../../api";
import {grey} from "../../../../themes/colors/aptosColorPalette";
import {useNavigate} from "../../../../routing";
import { Code } from "../../Components/CodeSnippet";
import { PackageMetadata, useGetAccountPackages } from "../../../../api/hooks/useGetAccountResource";

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
            Unfortunately, we are not supporting write method on mobile at the
            moment.
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

  const moduleAndFnsGroup = modules.reduce((acc, module) => {
    if (module.abi === undefined) {
      return acc;
    }

    const fns = module.abi.exposed_functions.filter((fn) =>
      isRead
        ? fn.is_view
        : fn.is_entry && fn.params.length > 0 && fn.params[0] === "&signer",
    );
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
              <Divider sx={{margin: "16px 0"}} />
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

  return (
    <Box
      sx={{padding: "24px", maxHeight: "100vh", overflowY: "auto"}}
      bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      borderRadius={1}
    >
      <Box>
        {Object.entries(moduleAndFnsGroup)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([moduleName, fns]) => (
            <Box key={moduleName} marginBottom={3}>
              <Typography fontSize={14} fontWeight={600} marginBottom={"8px"}>
                {moduleName}
              </Typography>
              {isWideScreen ? (
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
                      />
                    );
                  })}
                  <Divider sx={{marginTop: "24px"}} />
                </Box>
              ) : (
                <FormControl fullWidth>
                  <Select
                    value={selectedModuleName}
                    onChange={(e) =>
                      navigate(getLinkToFn(moduleName, e.target.value))
                    }
                  >
                    {fns.map((fn) => {
                      const selected =
                        moduleName === selectedModuleName &&
                        fn.name === selectedFnName;
                      return (
                        <MenuItem
                          key={fn.name}
                          value={fn.name}
                          sx={
                            theme.palette.mode === "dark" && selected
                              ? {
                                  color: grey[400],
                                  ":hover": {
                                    color: grey[200],
                                  },
                                }
                              : {}
                          }
                        >
                          {fn.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            </Box>
          ))}
      </Box>
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
  const {submitTransaction} = useSubmitTransaction();

  const onSubmit: SubmitHandler<ContractFormType> = async (data) => {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${module.address}::${module.name}::${fn.name}`,
      type_arguments: data.typeArgs,
      arguments: data.args,
    };
    await submitTransaction(payload);
  };

  return (
    <ContractForm
      fn={fn}
      onSubmit={onSubmit}
      result={
        connected ? (
          <Button type="submit" variant="contained" sx={{maxWidth: "8rem"}}>
            Write
          </Button>
        ) : (
          <Box display="flex" flexDirection="row" alignItems="center">
            <WalletConnector networkSupport={state.network_name} />
            <Typography ml={2} fontSize={10}>
              To write you need to connect wallet first
            </Typography>
          </Box>
        )
      }
    />
  );
}

function ReadContractForm({
  module,
  fn,
}: {
  module: Types.MoveModule;
  fn: Types.MoveFunction;
}) {
  const [state] = useGlobalState();
  const [result, setResult] = useState<Types.MoveValue[]>([]);
  const [errMsg, setErrMsg] = useState<string>();

  const onSubmit: SubmitHandler<ContractFormType> = async (data) => {
    const viewRequest: Types.ViewRequest = {
      function: `${module.address}::${module.name}::${fn.name}`,
      type_arguments: data.typeArgs,
      arguments: data.args,
    };
    try {
      const result = await view(viewRequest, state.network_value);
      setResult(result);
    } catch (e: any) {
      setErrMsg(e.message ?? String(e));
    }
  };

  return (
    <ContractForm
      fn={fn}
      onSubmit={onSubmit}
      result={
        <Box display="flex" flexDirection="row" alignItems="center">
          <Button type="submit" variant="contained" sx={{maxWidth: "8rem"}}>
            Query
          </Button>
          <Typography
            ml={2}
            fontSize={10}
            whiteSpace="nowrap"
            sx={{overflowX: "auto"}}
          >
            {errMsg ?? JSON.stringify(result, null, 2)}
          </Typography>
        </Box>
      }
    />
  );
}

function ContractForm({
  fn,
  onSubmit,
  result,
}: {
  fn: Types.MoveFunction;
  onSubmit: SubmitHandler<ContractFormType>;
  result: ReactNode;
}) {
  const {account} = useWallet();
  const {handleSubmit, control} = useForm<ContractFormType>({
    mode: "all",
    defaultValues: {
      typeArgs: [],
      args: [],
    },
  });
  const theme = useTheme();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        padding={3}
        borderRadius={1}
        bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
      >
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
            {fn.is_entry &&
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
            {fn.params.slice(fn.is_entry ? 1 : 0).map((param, i) => {
              return (
                <Controller
                  key={`args-${i}`}
                  name={`args.${i}`}
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <TextField
                      onChange={onChange}
                      value={value}
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

export default Contract;
