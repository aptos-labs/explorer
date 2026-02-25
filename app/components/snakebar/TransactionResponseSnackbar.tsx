import CloseIcon from "@mui/icons-material/Close";
import {IconButton} from "@mui/material";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import type {TransactionResponse} from "../../api/hooks/useSubmitTransaction";
import ErrorSnackbar from "./ErrorSnackbar";
import FailureSnackbar from "./FailureSnackbar";

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

  return (
    <TransactionStatusSnackbar
      transactionHash={transactionResponse.transactionHash}
      onCloseSnackbar={onCloseSnackbar}
    />
  );
}

interface TransactionStatusSnackbarProps {
  transactionHash: string;
  onCloseSnackbar: () => void;
}

function TransactionStatusSnackbar({
  transactionHash,
  onCloseSnackbar,
}: TransactionStatusSnackbarProps) {
  const {data, status} = useGetTransaction(transactionHash);

  if (status !== "success") {
    return null;
  }

  if (!data) return null;

  const isTransactionSuccess =
    data && "success" in data && data.success === true;

  return (
    <>
      {!isTransactionSuccess && (
        <FailureSnackbar onCloseSnackbar={onCloseSnackbar} data={data} />
      )}
    </>
  );
}
