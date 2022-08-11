import React from "react";
import {Snackbar, Alert} from "@mui/material";
import {CloseAction} from "./TransactionResponseSnackbar";

type ErrorSnackbarProps = {
  errorMessage: string;
  onCloseSnackbar: () => void;
};

export default function ErrorSnackbar({
  errorMessage,
  onCloseSnackbar,
}: ErrorSnackbarProps) {
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
