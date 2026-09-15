import {ErrorOutlineOutlined as ErrorOutline} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import type React from "react";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {useTranslation} from "../../i18n";

type ErrorProps = {
  error: ResponseError;
  tokenId?: string;
};

export default function TokenError({error, tokenId}: ErrorProps) {
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
        t("notFound.tokenTitle"),
        <>
          {error.message || t("notFound.tokenBody")}
          {tokenId && t("notFound.tokenIdSuffix", {id: tokenId})}
        </>,
      );
    case ResponseErrorType.INVALID_INPUT:
      return renderErrorContent(
        t("notFound.tokenInvalid"),
        <>
          {t("notFound.tokenInvalidBody", {
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
        t("notFound.tokenLoad"),
        <>
          {t("notFound.tokenLoadBody")}
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
