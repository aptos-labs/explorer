import React, {useEffect} from "react";
import {Grid, Button, FormControl, InputLabel} from "@mui/material";
import {Header} from "../components/Header";
import useSubmitStake from "../hooks/useSubmitStake";
import {
  TransactionResponseOnError,
  TransactionResponseOnSubmission,
} from "../../../api/hooks/useSubmitTransaction";
import useAddressInput from "../../../api/hooks/useAddressInput";
import useAmountInput from "../../../api/hooks/useAmountInput";
import {isValidAccountAddress} from "../../utils";
import TransactionResponseSnackbar from "../components/snackbar/TransactionResponseSnackbar";

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

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      clearStakingAmount();
      clearOperatorAddr();
      clearVoterAddr();
    }
  }, [transactionResponse]);

  return (
    <>
      <TransactionResponseSnackbar
        transactionResponse={transactionResponse}
        onCloseSnackbar={onCloseSnackbar}
      />
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
