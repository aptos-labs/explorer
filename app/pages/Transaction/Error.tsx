import {ErrorOutlineOutlined as ErrorOutline} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import ContentBox from "../../components/IndividualPageContent/ContentBox";
import {useTranslation} from "../../i18n";

type ErrorProps = {
  error: ResponseError;
  txnHashOrVersion: string;
};

export default function TransactionError({
  error,
  txnHashOrVersion,
}: ErrorProps) {
  const theme = useTheme();
  const {t} = useTranslation();

  if (error.type === ResponseErrorType.NOT_FOUND) {
    return (
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
              {t("notFound.transactionTitle")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
              }}
            >
              {error.message && `${error.message} `}
              {t("notFound.transactionBody", {id: txnHashOrVersion})}
            </Typography>
          </Stack>
        </Stack>
      </ContentBox>
    );
  } else {
    return (
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
              {t("notFound.transactionLoad")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
              }}
            >
              {t("notFound.transactionLoadBody", {id: txnHashOrVersion})}
              <br />
              {error.message}
              <br />
              <br />
              {t("common.tryAgainLater")}
            </Typography>
          </Stack>
        </Stack>
      </ContentBox>
    );
  }
}
