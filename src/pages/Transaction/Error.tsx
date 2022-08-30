import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Alert} from "@mui/material";

type ErrorProps = {
  error: ResponseError;
  txnHashOrVersion: string;
};

export default function Error({error, txnHashOrVersion}: ErrorProps) {
  if (error.type == ResponseErrorType.NOT_FOUND) {
    return (
      <Alert severity="error">
        {`${error} Could not find a transaction with version or hash ${txnHashOrVersion}`}
      </Alert>
    );
  } else {
    return (
      <Alert severity="error">
        Unknown error fetching transaction with version or hash{" "}
        {txnHashOrVersion}:<br />
        {error.message}
        <br />
        Try again later
      </Alert>
    );
  }
}
