import React, {useEffect} from "react";
import {Grid, Button, FormControl, Tooltip} from "@mui/material";
import {useWalletContext} from "../../context/wallet/context";
import useSubmitStake from "../../api/hooks/useSubmitStake";
import useAddressInput from "../../api/hooks/useAddressInput";
import useAmountInput from "./hooks/useAmountInput";
import TransactionResponseSnackbar from "../../components/snackbar/TransactionResponseSnackbar";
import LoadingModal from "../../components/LoadingModal";

type CreateProps = {
  onCreateStackingPoolSuccess: () => void;
};

export function Create({
  onCreateStackingPoolSuccess,
}: CreateProps): JSX.Element {
  const {isConnected: isWalletConnected} = useWalletContext();

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

  const {
    submitStake,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitStake();

  const onSubmitClick = async () => {
    const isStakingAmountValid = validateStakingAmountInput();
    const isOperatorAddrValid = validateOperatorAddressInput();
    const isVoterAddrValid = validateVoterAddressInput();

    if (isStakingAmountValid && isOperatorAddrValid && isVoterAddrValid) {
      await submitStake(stakingAmount, operatorAddr, voterAddr);
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
      onCreateStackingPoolSuccess();
    }
  }, [transactionResponse]);

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
