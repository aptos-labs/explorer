import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Alert} from "@mui/material";
import {renderDebug} from "../utils";

type ErrorProps = {
  error: ResponseError;
  height: string;
};

export default function Error({error, height}: ErrorProps) {
  if (error.type == ResponseErrorType.NOT_FOUND) {
    return (
      <Alert severity="error">
        {error.message}
        Could not find an Block with height {height}
      </Alert>
    );
  } else {
    return (
      <Alert severity="error">
        Unknown error ({error.type}) fetching an Account with height {height}:
        <br />
        {renderDebug(error.message)}
        <br />
        Try again later
      </Alert>
    );
  }
}
