import React from "react";
import {Typography, Stack, useTheme} from "@mui/material";
import {ErrorOutline} from "@mui/icons-material";
import ContentBox from "../../components/IndividualPageContent/ContentBox";

export default function NotFoundPage() {
  const theme = useTheme();

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
            Page Not Found (404)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Maybe the page you are looking for has been removed, or you typed in
            the wrong URL.
            <br />
            <br />
            You don't have to go home, but you can't stay here!
          </Typography>
        </Stack>
      </Stack>
    </ContentBox>
  );
}
