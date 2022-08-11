import React from "react";
import {Types} from "aptos";
import {IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {TransactionResponse} from "../../../../api/hooks/useSubmitTransaction";
import {useGetTransaction} from "../../../../api/hooks/useGetTransaction";
import SuccessSnackbar from "./SuccessSnackbar";
import FailureSnackbar from "./FailureSnackbar";
import ErrorSnackbar from "./ErrorSnackbar";

export function CloseAction({onCloseSnackbar}: {onCloseSnackbar: () => void}) {
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
        errorMessage={transactionResponse.message}
        onCloseSnackbar={onCloseSnackbar}
      />
    );
  }

  const transactionHash = transactionResponse.transactionHash;
  const {data, status} = useGetTransaction(transactionHash);

  if (status !== "success") {
    return null;
  }

  const isTransactionSuccess =
    data && "success" in data && data.success === true;

  return (
    <>
      {isTransactionSuccess && (
        <SuccessSnackbar
          transactionHash={transactionHash}
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
