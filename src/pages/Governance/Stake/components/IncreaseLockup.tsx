import React from "react";
import {Grid, Button, FormControl, Tooltip, Typography} from "@mui/material";
import TransactionResponseSnackbar from "../../components/snackbar/TransactionResponseSnackbar";
import LoadingModal from "../../components/LoadingModal";
import useSubmitIncreaseLock from "../../hooks/useSubmitIncreaseLock";
import {renderTimestamp} from "../../../Transactions/helpers";

type IncreaseLockupProps = {
  isWalletConnected: boolean;
  lockedUntilSec: string;
};

export function IncreaseLockup({
  isWalletConnected,
  lockedUntilSec,
}: IncreaseLockupProps): JSX.Element {
  const {
    submitIncreaseLockup,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitIncreaseLock();

  const onIncreaseLockupClick = async () => {
    await submitIncreaseLockup();
  };

  const onCloseSnackbar = () => {
    clearTransactionResponse();
  };

  const submitDisabled = !isWalletConnected;
  const submitButton = (
    <span>
      <Button fullWidth variant="primary" onClick={onIncreaseLockupClick}>
        Increase Lockup
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
        <Grid container spacing={4} alignItems="center">
          <></>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1">
              locked until: {renderTimestamp(lockedUntilSec)}
            </Typography>
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
