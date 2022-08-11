import * as RRD from "react-router-dom";
import React from "react";
import {Types} from "aptos";
import {
  Snackbar,
  Alert,
  Box,
  Button,
  IconButton,
  Typography,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
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
        <Typography variant="inherit">
          Succeeded with transaction {""}
          <Link
            component={RRD.Link}
            to={`/txn/${transactionHash}`}
            color="inherit"
            target="_blank"
          >
            {transactionHash}
          </Link>
          {refreshOnSuccess === true &&
            `. Please refresh to see the updated result.`}
        </Typography>
      </Alert>
    </Snackbar>
  );
}

type FailureSnackbarProps = {
  transactionHash: string;
  onCloseSnackbar: () => void;
};

function FailureSnackbar({
  transactionHash,
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
        <Typography variant="inherit">
          Failed with transaction {""}
          <Link
            component={RRD.Link}
            to={`/txn/${transactionHash}`}
            color="inherit"
            target="_blank"
          >
            {transactionHash}
          </Link>
          {"."} Please try again.
        </Typography>
      </Alert>
    </Snackbar>
  );
}

type ErrorSnackbarProps = {
  errorMessage: string;
  onCloseSnackbar: () => void;
};

function ErrorSnackbar({errorMessage, onCloseSnackbar}: ErrorSnackbarProps) {
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
        {`Failed with error message "${errorMessage}". Please try again.`}
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
      <ErrorSnackbar
        errorMessage={
          (transactionResponse as TransactionResponseOnError).message
        }
        onCloseSnackbar={onCloseSnackbar}
      />
    );
  }

  const transactionHash = (
    transactionResponse as TransactionResponseOnSubmission
  ).transactionHash;
  const {data, status} = useGetTransaction(transactionHash);

  if (status !== "success") {
    return null;
  }

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
          transactionHash={transactionHash}
          onCloseSnackbar={onCloseSnackbar}
        />
      )}
    </>
  );
}
