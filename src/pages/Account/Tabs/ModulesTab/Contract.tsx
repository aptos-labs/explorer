import {Types} from "aptos";
import {ReactNode, useEffect, useState} from "react";
import Error from "../../Error";
import {useGetAccountModules} from "../../../../api/hooks/useGetAccountModules";
import EmptyTabContent from "../../../../components/IndividualPageContent/EmptyTabContent";
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
} from "@mui/material";
import React from "react";
import {useForm, SubmitHandler, Controller} from "react-hook-form";
import useSubmitTransaction from "../../../../api/hooks/useSubmitTransaction";
import {useGlobalState} from "../../../../global-config/GlobalConfig";
import {view} from "../../../../api";
import {grey} from "../../../../themes/colors/aptosColorPalette";

type ContractFormType = {
  typeArgs: string[];
  args: string[];
};

interface ContractSidebarProps {
  selectedModuleName: string | undefined;
  selectedFnName: string | undefined;
  moduleAndFnsGroup: Record<string, Types.MoveFunction[]>;
  handleClick: (moduleName: string, fnName: string) => void;
}

function Contract({address, isRead}: {address: string; isRead: boolean}) {
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

  return (
    <Grid container spacing={2}>
      <Grid item md={3} xs={12}>
        <ContractSidebar
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
          <EmptyTabContent message="Please select a function" />
        ) : isRead ? (
          <ReadContractForm module={module} fn={fn} />
        ) : (
          <RunContractForm module={module} fn={fn} />
        )}
      </Grid>
    </Grid>
  );
}

function ContractSidebar({
  selectedModuleName,
  selectedFnName,
  moduleAndFnsGroup,
  handleClick,
}: ContractSidebarProps) {
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
        {Object.entries(moduleAndFnsGroup)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([moduleName, fns]) => (
            <Box key={moduleName} marginBottom={3}>
              <Typography fontSize={14} fontWeight={500} marginBottom={"8px"}>
                {moduleName}
              </Typography>
              {fns.map((fn) => {
                const selected =
                  moduleName === selectedModuleName &&
                  fn.name === selectedFnName;
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
                      ...(theme.palette.mode === "dark" && !selected
                        ? {
                            color: grey[400],
                            ":hover": {
                              color: grey[200],
                            },
                          }
                        : {}),
                      bgcolor: !selected
                        ? "transparent"
                        : theme.palette.mode === "dark"
                        ? grey[500]
                        : grey[200],
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

  // TODO: ideally we won't need this useEffect workaround
  // should understand why the change of fn doesn't trigger re-render of the component
  useEffect(() => {
    setResult([]);
    setErrMsg(undefined);
  }, [fn]);

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
