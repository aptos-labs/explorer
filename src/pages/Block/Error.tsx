import React from "react";
import {ResponseError, ResponseErrorType} from "../../api/client";
import {Typography, Stack, useTheme} from "@mui/material";
import {ErrorOutline} from "@mui/icons-material";
import ContentBox from "../../components/IndividualPageContent/ContentBox";

type ErrorProps = {
  error: ResponseError;
  height: string;
};

export default function Error({error, height}: ErrorProps) {
  const theme = useTheme();

  if (error.type == ResponseErrorType.NOT_FOUND) {
    return (
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
              Block Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {error.message && `${error.message} `}
              Could not find a block with height {height}
            </Typography>
          </Stack>
        </Stack>
      </ContentBox>
    );
  } else {
    return (
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
              Error Loading Block
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Unknown error fetching block with height {height}:
              <br />
              {error.message}
              <br />
              <br />
              Try again later
            </Typography>
          </Stack>
        </Stack>
      </ContentBox>
    );
  }
}
