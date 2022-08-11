import {Snackbar, Alert, Box, Button, IconButton} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import {Types} from "aptos";
import {
  TransactionResponse,
  TransactionResponseOnError,
  TransactionResponseOnSubmission,
} from "../../../api/hooks/useSubmitTransaction";
import {useGetTransaction} from "../../../api/hooks/useGetTransaction";

function CloseAction({onCloseSnackbar}: {onCloseSnackbar: () => void}) {
  return (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onCloseSnackbar}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );
}

function RefreshAction() {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <Box alignSelf="center" marginRight={1.5}>
      <Button
        variant="outlined"
        color="inherit"
        size="large"
        onClick={refreshPage}
        endIcon={<RefreshIcon />}
      >
        Refresh
      </Button>
    </Box>
  );
}

type SuccessSnackbarProps = {
  transactionHash: string;
  refreshOnSuccess?: boolean;
  onCloseSnackbar: () => void;
};

function SuccessSnackbar({
  transactionHash,
  refreshOnSuccess,
  onCloseSnackbar,
}: SuccessSnackbarProps) {
  return (
    <Snackbar
      open={true}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="success"
        action={
          refreshOnSuccess ? (
            <RefreshAction />
          ) : (
            <CloseAction onCloseSnackbar={onCloseSnackbar} />
          )
        }
      >
        {refreshOnSuccess === true
          ? `Succeeded with transaction ${transactionHash}. Please refresh to see the updated result.`
          : `Succeeded with transaction ${transactionHash}.`}
      </Alert>
    </Snackbar>
  );
}

type FailureMessage = {transactionHash: string} | {errorMessage: string};

type FailureSnackbarProps = {
  failureMessage: FailureMessage;
  onCloseSnackbar: () => void;
};

function FailureSnackbar({
  failureMessage,
  onCloseSnackbar,
}: FailureSnackbarProps) {
  return (
    <Snackbar
      open={true}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Alert
        variant="filled"
        severity="error"
        action={<CloseAction onCloseSnackbar={onCloseSnackbar} />}
      >
        {"transactionHash" in failureMessage
          ? `Failed with transaction ${failureMessage.transactionHash}. Please try again.`
          : `Failed with error message "${failureMessage.errorMessage}". Please try again.`}
      </Alert>
    </Snackbar>
  );
}

type TransactionResponseSnackbarProps = {
  transactionResponse: TransactionResponse | null;
  onCloseSnackbar: () => void;
  refreshOnSuccess?: boolean;
};

export default function TransactionResponseSnackbar({
  transactionResponse,
  onCloseSnackbar,
  refreshOnSuccess,
}: TransactionResponseSnackbarProps) {
  if (transactionResponse == null) {
    return null;
  }

  if (!transactionResponse.transactionSubmitted) {
    return (
      <FailureSnackbar
        failureMessage={{
          errorMessage: (transactionResponse as TransactionResponseOnError)
            .message,
        }}
        onCloseSnackbar={onCloseSnackbar}
      />
    );
  }

  const transactionHash = (
    transactionResponse as TransactionResponseOnSubmission
  ).transactionHash;
  const {data} = useGetTransaction(transactionHash);
  const isTransactionSuccess =
    (data as Types.UserTransaction)?.success === true;

  return (
    <>
      {isTransactionSuccess && (
        <SuccessSnackbar
          transactionHash={transactionHash as string}
          refreshOnSuccess={refreshOnSuccess}
          onCloseSnackbar={onCloseSnackbar}
        />
      )}
      {!isTransactionSuccess && (
        <FailureSnackbar
          failureMessage={{transactionHash}}
          onCloseSnackbar={onCloseSnackbar}
        />
      )}
    </>
  );
}
