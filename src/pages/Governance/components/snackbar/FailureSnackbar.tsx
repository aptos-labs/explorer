import * as RRD from "react-router-dom";
import React from "react";
import {Snackbar, Alert, Typography, Link} from "@mui/material";
import {CloseAction} from "./TransactionResponseSnackbar";
import {Types} from "aptos";

type FailureSnackbarProps = {
  transactionHash: string;
  onCloseSnackbar: () => void;
  data: Types.Transaction | undefined;
};

export default function FailureSnackbar({
  transactionHash,
  onCloseSnackbar,
  data,
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
          Transaction {""}
          <Link
            component={RRD.Link}
            to={`/txn/${transactionHash}`}
            color="inherit"
            target="_blank"
          >
            {transactionHash}
          </Link>
          {"."} Failed{" "}
          {data && "vm_status" in data && data?.vm_status
            ? `with ${data.vm_status}`
            : ""}
          .
        </Typography>
      </Alert>
    </Snackbar>
  );
}
