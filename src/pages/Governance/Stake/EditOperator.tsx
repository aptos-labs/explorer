import React, {useEffect} from "react";
import {
  Grid,
  Button,
  FormControl,
  Tooltip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {Header} from "../components/Header";
import {useWalletContext} from "../../../context/wallet/context";
import TransactionResponseSnackbar from "../components/snackbar/TransactionResponseSnackbar";
import LoadingModal from "../components/LoadingModal";
import {useGetAccountResource} from "../../../api/hooks/useGetAccountResource";
import useAddressInput from "../../../api/hooks/useAddressInput";
import useSubmitChangeOperatorStake from "../hooks/useSubmitChangeOperatorStake";
import HashButton from "../../../components/HashButton";

interface StakingConfigData {
  operator_address: string;
}

export function EditOperator() {
  const {isConnected: isWalletConnected, accountAddress} = useWalletContext();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const stakePool = useGetAccountResource(
    accountAddress || "0x1",
    "0x1::stake::StakePool",
  );

  const {
    addr: operatorAddr,
    clearAddr: clearOperatorAddr,
    renderAddressTextField: renderOperatorAddressTextField,
    validateAddressInput: validateOperatorAddressInput,
  } = useAddressInput();

  const {
    changeOperatorStake,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitChangeOperatorStake();

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      clearOperatorAddr();
    }
  }, [transactionResponse]);

  if (!accountAddress) {
    return <div>No account addres</div>;
  }

  if (!stakePool) {
    return <div>No stakePool</div>;
  }

  const onSubmitClick = async () => {
    const isOperatorAddrValid = validateOperatorAddressInput();
    if (isOperatorAddrValid) {
      await changeOperatorStake(operatorAddr);
    }
  };

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

  const {operator_address} = stakePool.data as StakingConfigData;
  const submitDisabled = !isWalletConnected;
  const submitButton = (
    <span>
      <Button
        fullWidth
        variant="primary"
        disabled={submitDisabled}
        onClick={onSubmitClick}
      >
        Submit
      </Button>
    </span>
  );

  return (
    <>
      <TransactionResponseSnackbar
        transactionResponse={transactionResponse}
        onCloseSnackbar={onCloseSnackbar}
      />
      <LoadingModal open={transactionInProcess} />
      <Grid>
        <Header />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Stack
              direction={isOnMobile ? "column" : "row"}
              spacing={1}
              alignItems={isOnMobile ? "flex-start" : "center"}
            >
              <Typography variant="subtitle1">
                Current Operator Address:
              </Typography>
              <HashButton hash={operator_address} />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            {renderOperatorAddressTextField("New Operator Address")}
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              {submitDisabled ? (
                <Tooltip title="Please connect your wallet" arrow>
                  {submitButton}
                </Tooltip>
              ) : (
                submitButton
              )}
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
