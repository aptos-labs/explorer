import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Alert} from "@mui/material";

type ErrorProps = {
  error: ResponseError;
  struct?: string;
};

export default function Error({error, struct}: ErrorProps) {
  switch (error.type) {
    case ResponseErrorType.NOT_FOUND:
      return (
        <Alert severity="error" sx={{overflowWrap: "break-word"}}>
          {error.message}
          Coin not found: {struct}.
        </Alert>
      );
    case ResponseErrorType.INVALID_INPUT:
      return (
        <Alert severity="error">
          ({error.type}): {error.message}
        </Alert>
      );
    case ResponseErrorType.UNHANDLED:
      if (struct) {
        return (
          <Alert severity="error">
            Unknown error ({error.type}) fetching a Coin {struct}:
            <br />
            {error.message}
            <br />
            Try again later
          </Alert>
        );
      } else {
        return (
          <Alert severity="error">
            Too many requests. Please try again 5 minutes later.
          </Alert>
        );
      }
    case ResponseErrorType.TOO_MANY_REQUESTS:
      return (
        <Alert severity="error">
          Too many requests. Please try again 5 minutes later.
        </Alert>
      );
  }
}
