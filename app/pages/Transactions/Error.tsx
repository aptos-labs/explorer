import {ErrorOutlineOutlined as ErrorOutline} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {useTranslation} from "../../i18n";

type ErrorProps = {
  error: ResponseError;
};

export default function TransactionsError({error}: ErrorProps) {
  const theme = useTheme();
  const {t} = useTranslation();

  const renderErrorContent = (title: string, message: React.ReactNode) => (
    <ContentBox>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "flex-start",
        }}
      >
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
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            {message}
          </Typography>
        </Stack>
      </Stack>
    </ContentBox>
  );

  switch (error.type) {
    case ResponseErrorType.NOT_FOUND:
      return renderErrorContent(
        t("notFound.transactionsTitle"),
        error.message || t("notFound.transactionsBody"),
      );
    case ResponseErrorType.INVALID_INPUT:
      return renderErrorContent(
        t("errors.invalidRequest"),
        <>
          {t("errors.invalidRequestDetail", {
            type: error.type,
            message: error.message ?? "",
          })}
        </>,
      );
    case ResponseErrorType.TOO_MANY_REQUESTS:
      return renderErrorContent(
        t("errors.tooManyRequests"),
        <>{t("errors.tooManyRequestsMoments")}</>,
      );
    default:
      return renderErrorContent(
        t("notFound.transactionsLoad"),
        <>
          {t("notFound.transactionsLoadBody")}
          {error.message && (
            <>
              <br />
              {error.message}
            </>
          )}
          <br />
          <br />
          {t("common.pleaseTryAgainLater")}
        </>,
      );
  }
}
