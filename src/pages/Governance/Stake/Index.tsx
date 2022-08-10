import React, {useEffect, useState} from "react";
import {
  Grid,
  TextField,
  Button,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {Header} from "../Header";
import useSubmitStake from "../hooks/useSubmitStake";
import {
  TransactionResponseOnFailure,
  TransactionResponseOnSuccess,
} from "../../../api/hooks/useSubmitTransaction";
import {isValidAccountAddress} from "../../utils";

export function StakePage() {
  const [stakingAmount, setStakingAmount] = useState<string>("");
  const [operatorAddr, setOperatorAddr] = useState<string>("");
  const [operatorAddrIsValid, setOperatorAddrIsValid] = useState<boolean>(true);
  const [voterAddr, setVoterAddr] = useState<string>("");
  const [voterAddrIsValid, setVoterAddrIsValid] = useState<boolean>(true);

  const {submitStake, transactionResponse, clearTransactionResponse} =
    useSubmitStake();

  useEffect(() => {
    setOperatorAddrIsValid(true);
  }, [operatorAddr]);

  useEffect(() => {
    setVoterAddrIsValid(true);
  }, [voterAddr]);

  const onStakingAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStakingAmount(event.target.value.replace(/[^0-9]/g, ""));
  };

  const onOperatorAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorAddr(event.target.value);
  };

  const onVoterAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoterAddr(event.target.value);
  };

  const onSubmitClick = async () => {
    // TODO - this will likely be very dependent per network
    // pull from on chain config 0x1::stake::ValidatorSetConfiguration
    const stakingAmountNumber = parseInt(stakingAmount);
    if (stakingAmountNumber <= 0) return;

    const isOperatorAddrValid = isValidAccountAddress(operatorAddr);
    setOperatorAddrIsValid(isOperatorAddrValid);

    const isVoterAddrValid = isValidAccountAddress(voterAddr);
    setVoterAddrIsValid(isVoterAddrValid);

    if (isOperatorAddrValid && isVoterAddrValid) {
      await submitStake(parseInt(stakingAmount), operatorAddr, voterAddr);
    }
  };

  const onCloseErrorAlert = () => {
    clearTransactionResponse();
  };

  useEffect(() => {
    if (transactionResponse?.succeeded) {
      setStakingAmount("");
      setOperatorAddr("");
      setVoterAddr("");
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
      open={transactionResponse.succeeded}
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
          (transactionResponse as TransactionResponseOnSuccess).transactionHash
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
      open={!transactionResponse.succeeded}
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
          (transactionResponse as TransactionResponseOnFailure).message
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
            <FormControl fullWidth>
              <InputLabel htmlFor="outlined-adornment-amount">
                Staking Amount
              </InputLabel>
              <OutlinedInput
                label="Staking Amount"
                value={stakingAmount}
                onChange={onStakingAmountChange}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {operatorAddrIsValid ? (
              <TextField
                fullWidth
                label="Operator Address"
                variant="outlined"
                value={operatorAddr}
                onChange={onOperatorAddrChange}
              />
            ) : (
              <TextField
                error
                fullWidth
                label="Operator Address"
                variant="outlined"
                value={operatorAddr}
                onChange={onOperatorAddrChange}
                helperText="Incorrect address"
              />
            )}
          </Grid>
          <Grid item xs={12}>
            {voterAddrIsValid ? (
              <TextField
                fullWidth
                label="Voter Address"
                variant="outlined"
                value={voterAddr}
                onChange={onVoterAddrChange}
              />
            ) : (
              <TextField
                error
                fullWidth
                label="Voter Address"
                variant="outlined"
                value={voterAddr}
                onChange={onVoterAddrChange}
                helperText="Incorrect address"
              />
            )}
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
