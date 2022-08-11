import * as RRD from "react-router-dom";
import React from "react";
import {Snackbar, Alert, Box, Button, Typography, Link} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {CloseAction} from "./TransactionResponseSnackbar";

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

export default function SuccessSnackbar({
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
