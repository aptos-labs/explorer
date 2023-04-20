import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Alert} from "@mui/material";

type ErrorProps = {
  error: ResponseError;
  address?: string;
};

export default function Error({error, address}: ErrorProps) {
  switch (error.type) {
    case ResponseErrorType.NOT_FOUND:
      return (
        <Alert severity="error" sx={{overflowWrap: "break-word"}}>
          {error.message}
          Account not found: {address}
        </Alert>
      );
    case ResponseErrorType.UNHANDLED:
      if (address) {
        return (
          <Alert severity="error">
            Unknown error ({error.type}) fetching an Account with address{" "}
            {address}:
            <br />
            {error.message}
            <br />
            Try again later
          </Alert>
        );
      } else {
        return (
          <Alert severity="error">
            To many requests. Please try again 5 minutes later.
          </Alert>
        );
      }
    case ResponseErrorType.TOO_MANY_REQUESTS:
      return (
        <Alert severity="error">
          To many requests. Please try again 5 minutes later.
        </Alert>
      );
  }
}
