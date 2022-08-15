import * as RRD from "react-router-dom";
import React from "react";
import {Snackbar, Alert, Typography, Link} from "@mui/material";
import {CloseAction} from "./TransactionResponseSnackbar";

type FailureSnackbarProps = {
  transactionHash: string;
  onCloseSnackbar: () => void;
};

export default function FailureSnackbar({
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
