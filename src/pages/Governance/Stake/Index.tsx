import React, {useEffect, useState} from "react";
import {
  Grid,
  TextField,
  Button,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {Header} from "../Header";
import useSubmitStake, {
  StakeResponseOnFailure,
  StakeResponseOnSuccess,
} from "../hooks/useSubmitStake";

export function StakePage() {
  const [stakingAmount, setStakingAmount] = useState<string>("");
  const [operatorAddr, setOperatorAddr] = useState<string>("");
  const [voterAddr, setVoterAddr] = useState<string>("");

  const {submitStake, stakeResponse, clearStakeResponse} = useSubmitStake();

  const onStakingAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStakingAmount(event.target.value);
  };

  const onOperatorAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOperatorAddr(event.target.value);
  };

  const onVoterAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoterAddr(event.target.value);
  };

  const onSubmitClick = async () => {
    if (!stakingAmount) return;
    await submitStake(parseInt(stakingAmount), operatorAddr, voterAddr);
  };

  const onCloseErrorAlert = () => {
    clearStakeResponse();
  };

  useEffect(() => {
    if (stakeResponse?.succeeded) {
      setStakingAmount("");
      setOperatorAddr("");
      setVoterAddr("");
    }
  }, [stakeResponse]);

  const voteOnSuccessSnackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onCloseErrorAlert}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  const voteOnSuccessSnackbar = stakeResponse !== null && (
    <Snackbar
      open={stakeResponse.succeeded}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="success"
        action={voteOnSuccessSnackbarAction}
      >
        {`Stake succeeded with transaction ${
          (stakeResponse as StakeResponseOnSuccess).transactionHash
        }.`}
      </Alert>
    </Snackbar>
  );

  const voteOnFailureSnackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onCloseErrorAlert}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  const voteOnFailureSnackbar = stakeResponse !== null && (
    <Snackbar
      open={!stakeResponse.succeeded}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="error"
        action={voteOnFailureSnackbarAction}
      >
        {`Stake failed with error message "${
          (stakeResponse as StakeResponseOnFailure).message
        }". Please try again.`}
      </Alert>
    </Snackbar>
  );

  return (
    <>
      {voteOnSuccessSnackbar}
      {voteOnFailureSnackbar}
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
            <TextField
              fullWidth
              label="Operator Address"
              variant="outlined"
              value={operatorAddr}
              onChange={onOperatorAddrChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Voter Address"
              variant="outlined"
              value={voterAddr}
              onChange={onVoterAddrChange}
            />
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
