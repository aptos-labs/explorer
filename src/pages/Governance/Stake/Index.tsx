import React, {useEffect} from "react";
import {
  Grid,
  Button,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {Header} from "../components/Header";
import useSubmitStake from "../hooks/useSubmitStake";
import {
  TransactionResponseOnError,
  TransactionResponseOnSubmission,
} from "../../../api/hooks/useSubmitTransaction";
import useAddressInput from "../../../api/hooks/useAddressInput";
import useAmountInput from "../../../api/hooks/useAmountInput";

export function StakePage() {
  const {
    amount: stakingAmount,
    clearAmount: clearStakingAmount,
    renderAmountTextField: renderStakingAmountTextField,
    validateAmountInput: validateStakingAmountInput,
  } = useAmountInput();

  const {
    addr: operatorAddr,
    clearAddr: clearOperatorAddr,
    renderAddressTextField: renderOperatorAddressTextField,
    validateAddressInput: validateOperatorAddressInput,
  } = useAddressInput();

  const {
    addr: voterAddr,
    clearAddr: clearVoterAddr,
    renderAddressTextField: renderVoterAddressTextField,
    validateAddressInput: validateVoterAddressInput,
  } = useAddressInput();

  const {submitStake, transactionResponse, clearTransactionResponse} =
    useSubmitStake();

  const onSubmitClick = async () => {
    const isStakingAmountValid = validateStakingAmountInput();
    const isOperatorAddrValid = validateOperatorAddressInput();
    const isVoterAddrValid = validateVoterAddressInput();

    if (isStakingAmountValid && isOperatorAddrValid && isVoterAddrValid) {
      await submitStake(parseInt(stakingAmount), operatorAddr, voterAddr);
    }
  };

  const onCloseErrorAlert = () => {
    clearTransactionResponse();
  };

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      clearStakingAmount();
      clearOperatorAddr();
      clearVoterAddr();
    }
  }, [transactionResponse]);

  const stakeOnSuccessSnackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onCloseErrorAlert}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  const stakeOnSuccessSnackbar = transactionResponse !== null && (
    <Snackbar
      open={transactionResponse.transactionSubmitted}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="success"
        action={stakeOnSuccessSnackbarAction}
      >
        {`Stake succeeded with transaction ${
          (transactionResponse as TransactionResponseOnSubmission)
            .transactionHash
        }.`}
      </Alert>
    </Snackbar>
  );

  const stakeOnFailureSnackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onCloseErrorAlert}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  const stakeOnFailureSnackbar = transactionResponse !== null && (
    <Snackbar
      open={!transactionResponse.transactionSubmitted}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="error"
        action={stakeOnFailureSnackbarAction}
      >
        {`Stake failed with error message "${
          (transactionResponse as TransactionResponseOnError).message
        }". Please try again.`}
      </Alert>
    </Snackbar>
  );

  return (
    <>
      {stakeOnSuccessSnackbar}
      {stakeOnFailureSnackbar}
      <Grid>
        <Header />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            {renderStakingAmountTextField("Staking Amount")}
          </Grid>
          <Grid item xs={12}>
            {renderOperatorAddressTextField("Operator Address")}
          </Grid>
          <Grid item xs={12}>
            {renderVoterAddressTextField("Voter Address")}
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Button variant="primary" onClick={onSubmitClick}>
                Submit
              </Button>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
