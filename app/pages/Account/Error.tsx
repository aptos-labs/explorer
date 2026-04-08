import {ErrorOutlined} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import ContentBox from "../../components/IndividualPageContent/ContentBox";

type ErrorProps = {
  error: ResponseError;
  address?: string;
  /** When set, replaces the default title for NOT_FOUND errors */
  notFoundTitle?: string;
  /** When set, replaces the default body for NOT_FOUND errors */
  notFoundMessage?: React.ReactNode;
};

export default function AccountError({
  error,
  address,
  notFoundTitle,
  notFoundMessage,
}: ErrorProps) {
  const theme = useTheme();

  const renderErrorContent = (title: string, message: React.ReactNode) => (
    <ContentBox>
      <Stack direction="row" spacing={2} sx={{alignItems: "flex-start"}}>
        <ErrorOutlined
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
        notFoundTitle ?? "Account Not Found",
        notFoundMessage ?? (
          <>
            {error.message && (
              <>
                {error.message}
                <br />
              </>
            )}
            Account not found. Please take a look at the Coins and Token tabs.
            The account has never submitted a transaction, but it may still hold
            assets.
          </>
        ),
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
          "Error Loading Account",
          <>
            Unknown error ({error.type}) fetching an Account with address{" "}
            {address}:
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
