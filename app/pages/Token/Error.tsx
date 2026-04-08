import {ErrorOutlined} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import ContentBox from "../../components/IndividualPageContent/ContentBox";

type ErrorProps = {
  error: ResponseError;
  tokenId?: string;
};

export default function TokenError({error, tokenId}: ErrorProps) {
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
        "Token Not Found",
        <>
          {error.message || "Token not found."}
          {tokenId && ` Token ID: ${tokenId}`}
        </>,
      );
    case ResponseErrorType.INVALID_INPUT:
      return renderErrorContent(
        "Invalid Token ID",
        <>
          Invalid token ID ({error.type}): {error.message}
        </>,
      );
    case ResponseErrorType.TOO_MANY_REQUESTS:
      return renderErrorContent(
        "Too Many Requests",
        <>Too many requests. Please try again in a few moments.</>,
      );
    default:
      return renderErrorContent(
        "Error Loading Token",
        <>
          Unable to load token information.
          {error.message && (
            <>
              <br />
              {error.message}
            </>
          )}
          <br />
          <br />
          Please try again later.
        </>,
      );
  }
}
