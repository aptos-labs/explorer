import {Snackbar, Alert, Typography} from "@mui/material";
import {CloseAction} from "./TransactionResponseSnackbar";
import {Types} from "aptos";
import React from "react";
import {InternalLink} from "../../routing";

type FailureSnackbarProps = {
  onCloseSnackbar: () => void;
  data: Types.Transaction;
};

export default function FailureSnackbar({
  onCloseSnackbar,
  data,
}: FailureSnackbarProps) {
  const {hash} = data;

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
          <InternalLink to={`/txn/${hash}`} color="inherit" target="_blank">
            {hash}
          </InternalLink>{" "}
          failed{" "}
          {"vm_status" in data && data.vm_status
            ? `with "${data.vm_status}"`
            : "."}
        </Typography>
      </Alert>
    </Snackbar>
  );
}
