import React, {useEffect, useState} from "react";
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
import TransactionResponseSnackbar from "../../components/snackbar/TransactionResponseSnackbar";
import LoadingModal from "../../components/LoadingModal";
import useAddressInput from "../../../../api/hooks/useAddressInput";
import useSubmitChangeOperatorStake from "../../hooks/useSubmitChangeOperatorStake";
import HashButton from "../../../../components/HashButton";

type EditOperatorProps = {
  isWalletConnected: boolean;
  operatorAddress: string;
};

export function EditOperator({
  isWalletConnected,
  operatorAddress,
}: EditOperatorProps): JSX.Element {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const [currOperatorAddress, setCurrOperatorAddress] =
    useState<string>(operatorAddress);

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
      setCurrOperatorAddress(operatorAddr);
      clearOperatorAddr();
    }
  }, [transactionResponse]);

  const onSubmitClick = async () => {
    const isOperatorAddrValid = validateOperatorAddressInput();
    if (isOperatorAddrValid) {
      await changeOperatorStake(operatorAddr);
    }
  };

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

  const submitDisabled = !isWalletConnected;
  const submitButton = (
    <span>
      <Button
        fullWidth
        variant="primary"
        disabled={submitDisabled}
        onClick={onSubmitClick}
      >
        Change Operator
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
              <HashButton hash={currOperatorAddress} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={8}>
            {renderOperatorAddressTextField("New Operator Address")}
          </Grid>
          <Grid item xs={12} sm={4}>
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
