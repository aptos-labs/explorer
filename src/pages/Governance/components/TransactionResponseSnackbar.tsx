import {Snackbar, Alert, Box, Button, IconButton} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  TransactionResponse,
  TransactionResponseOnError,
  TransactionResponseOnSubmission,
} from "../../../api/hooks/useSubmitTransaction";
import {useGetTransaction} from "../../../api/hooks/useGetTransaction";
import Transaction from "../../Transactions/Transaction";

type SuccessSnackbarProps = {
  transactionHash: string;
};

function SuccessSnackbar({transactionHash}: SuccessSnackbarProps) {
  const refreshPage = () => {
    window.location.reload();
  };

  const voteOnSuccessSnackbarAction = (
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
        action={voteOnSuccessSnackbarAction}
      >
        {`Succeeded with transaction ${transactionHash}. Please refresh to see your vote.`}
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
  const voteOnFailureSnackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={onCloseSnackbar}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

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
        action={voteOnFailureSnackbarAction}
      >
        {"transactionHash" in failureMessage
          ? `Failed with transaction "${failureMessage.transactionHash}". Please try again.`
          : `Failed with error message "${failureMessage.errorMessage}". Please try again.`}
      </Alert>
    </Snackbar>
  );
}

type TransactionResponseSnackbarProps = {
  transactionResponse: TransactionResponse | null;
  onCloseSnackbar: () => void;
};

export default function TransactionResponseSnackbar({
  transactionResponse,
  onCloseSnackbar,
}: TransactionResponseSnackbarProps) {
  if (transactionResponse == null) {
    return null;
  }

  // const transaction = useGetTransaction();

  return (
    <>
      <SuccessSnackbar transactionHash="" />
      <FailureSnackbar
        failureMessage={{transactionHash: ""}}
        onCloseSnackbar={onCloseSnackbar}
      />
    </>
  );
}
