import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Typography, Stack, useTheme} from "@mui/material";
import {ErrorOutline} from "@mui/icons-material";
import ContentBox from "../../components/IndividualPageContent/ContentBox";

type ErrorProps = {
  error: ResponseError;
  address?: string;
};

export default function Error({error, address}: ErrorProps) {
  const theme = useTheme();

  const renderErrorContent = (title: string, message: React.ReactNode) => (
    <ContentBox>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <ErrorOutline
          sx={{
            color: theme.palette.error.main,
            fontSize: 28,
            mt: 0.5,
          }}
        />
        <Stack spacing={1} sx={{flex: 1}}>
          <Typography variant="h6" color="error">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        </Stack>
      </Stack>
    </ContentBox>
  );

  switch (error.type) {
    case ResponseErrorType.NOT_FOUND:
      return renderErrorContent(
        "Fungible Asset Not Found",
        <>
          {error.message && (
            <>
              {error.message}
              <br />
            </>
          )}
          Fungible asset not found: {address}.
        </>,
      );
    case ResponseErrorType.INVALID_INPUT:
      return renderErrorContent(
        "Invalid Input",
        <>
          ({error.type}): {error.message}
        </>,
      );
    case ResponseErrorType.UNHANDLED:
      if (address) {
        return renderErrorContent(
          "Error Loading Fungible Asset",
          <>
            Unknown error ({error.type}) fetching a fungible asset {address}:
            <br />
            {error.message}
            <br />
            <br />
            Try again later
          </>,
        );
      } else {
        return renderErrorContent(
          "Too Many Requests",
          <>Too many requests. Please try again 5 minutes later.</>,
        );
      }
    case ResponseErrorType.TOO_MANY_REQUESTS:
      return renderErrorContent(
        "Too Many Requests",
        <>Too many requests. Please try again 5 minutes later.</>,
      );
  }
}
