import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Alert} from "@mui/material";

type ErrorProps = {
  error: ResponseError;
};

export default function TransactionsError({error}: ErrorProps) {
  switch (error.type) {
    case ResponseErrorType.NOT_FOUND:
      return (
        <Alert severity="error" sx={{overflowWrap: "break-word"}}>
          {error.message || "Transactions not found."}
        </Alert>
      );
    case ResponseErrorType.INVALID_INPUT:
      return (
        <Alert severity="error">
          Invalid request ({error.type}): {error.message}
        </Alert>
      );
    case ResponseErrorType.TOO_MANY_REQUESTS:
      return (
        <Alert severity="error">
          Too many requests. Please try again in a few moments.
        </Alert>
      );
    case ResponseErrorType.UNHANDLED:
    default:
      return (
        <Alert severity="error">
          Unable to load transactions.
          {error.message && (
            <>
              <br />
              {error.message}
            </>
          )}
          <br />
          Please try again later.
        </Alert>
      );
  }
}
