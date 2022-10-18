import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Alert} from "@mui/material";

type ErrorProps = {
  error: ResponseError;
  address: string;
};

export default function Error({error, address}: ErrorProps) {
  if (error.type == ResponseErrorType.NOT_FOUND) {
    return (
      <Alert severity="error">
        {error.message}
        Account not found: {address}
      </Alert>
    );
  } else {
    return (
      <Alert severity="error">
        Unknown error ({error.type}) fetching an Account with address {address}:
        <br />
        {error.message}
        <br />
        Try again later
      </Alert>
    );
  }
}
