import {ErrorOutlined} from "@mui/icons-material";
import {Stack, Typography, useTheme} from "@mui/material";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import ContentBox from "../../components/IndividualPageContent/ContentBox";

type ErrorProps = {
  error: ResponseError;
  txnHashOrVersion: string;
};

export default function TransactionError({
  error,
  txnHashOrVersion,
}: ErrorProps) {
  const theme = useTheme();

  if (error.type === ResponseErrorType.NOT_FOUND) {
    return (
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
              Transaction Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {error.message && `${error.message} `}
              Could not find a transaction with version or hash{" "}
              {txnHashOrVersion}
            </Typography>
          </Stack>
        </Stack>
      </ContentBox>
    );
  } else {
    return (
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
              Error Loading Transaction
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Unknown error fetching transaction with version or hash{" "}
              {txnHashOrVersion}:
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
