import {Types} from "aptos";
import {useState} from "react";
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
import {grey} from "@mui/material/colors";
import React from "react";
import {useForm, SubmitHandler, Controller} from "react-hook-form";
import useSubmitTransaction from "../../../../api/hooks/useSubmitTransaction";
import {useGlobalState} from "../../../../global-config/GlobalConfig";

type WriteContractFormType = {
  typeArgs: string[];
  args: string[];
};

interface WriteContractSidebarProps {
  selectedModuleName: string | undefined;
  selectedFnName: string | undefined;
  moduleAndFnsGroup: Record<string, Types.MoveFunction[]>;
  handleClick: (moduleName: string, fnName: string) => void;
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
              <Typography ml={2} fontSize={10}>
                To write you need to connect wallet first
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </form>
  );
}

export default WriteContract;
