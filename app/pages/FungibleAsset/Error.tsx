import {ErrorOutlineOutlined as ErrorOutline} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {useTranslation} from "../../i18n";

type ErrorProps = {
  error: ResponseError;
  address?: string;
};

export default function FungibleAssetError({error, address}: ErrorProps) {
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
        t("notFound.faTitle"),
        <>
          {error.message && (
            <>
              {error.message}
              <br />
            </>
          )}
          {t("notFound.faBody", {address: address ?? ""})}
        </>,
      );
    case ResponseErrorType.INVALID_INPUT:
      return renderErrorContent(
        t("errors.invalidInput"),
        <>
          {t("errors.typeAndMessage", {
            type: error.type,
            message: error.message ?? "",
          })}
        </>,
      );
    case ResponseErrorType.UNHANDLED:
      if (address) {
        return renderErrorContent(
          t("notFound.faLoad"),
          <>
            {t("notFound.faLoadBody", {type: error.type, address})}
            <br />
            {error.message}
            <br />
            <br />
            {t("common.tryAgainLater")}
          </>,
        );
      } else {
        return renderErrorContent(
          t("errors.tooManyRequests"),
          <>{t("errors.tooManyRequests5min")}</>,
        );
      }
    case ResponseErrorType.TOO_MANY_REQUESTS:
      return renderErrorContent(
        t("errors.tooManyRequests"),
        <>{t("errors.tooManyRequests5min")}</>,
      );
  }
}
