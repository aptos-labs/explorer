import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Alert} from "@mui/material";
import {renderDebug} from "../utils";

type ErrorProps = {
  error: ResponseError;
  address: string;
};

export default function Error({error, address}: ErrorProps) {
  if (error.type == ResponseErrorType.NOT_FOUND) {
    return (
      <Alert severity="error">
        {error.message}
        Could not find an Account with address {address}
      </Alert>
    );
  } else {
    return (
      <Alert severity="error">
        Unknown error ({error.type}) fetching an Account with address {address}:
        <br />
        {renderDebug(error.message)}
        <br />
        Try again later
      </Alert>
    );
  }
}
