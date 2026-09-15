import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import {alpha, Box, Stack, Typography, useTheme} from "@mui/material";
import {memo} from "react";
import {useTranslation} from "../i18n";

type TransactionStatusProps = {
  success: boolean;
};

// Extracted static styles
const tableStatusStyle = {display: "flex", alignItems: "center"} as const;
const iconStyle = {fontSize: "inherit"} as const;

export const TransactionStatus = memo(function TransactionStatus({
  success,
}: TransactionStatusProps) {
  const theme = useTheme();
  const {t} = useTranslation();
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const successBackgroundColor = alpha(successColor, 0.1);
  const errorBackgroundColor = alpha(errorColor, 0.1);

  return success ? (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        paddingY: 0.7,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        backgroundColor: successBackgroundColor,
        width: 114,
      }}
    >
      <CheckCircleIcon
        fontSize="small"
        titleAccess={t("txn.status.executedSuccessfully")}
        sx={{color: successColor}}
      />
      <Typography variant="body2" sx={{color: successColor}}>
        {t("txn.status.success")}
      </Typography>
    </Stack>
  ) : (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        paddingY: 0.7,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        backgroundColor: errorBackgroundColor,
        width: 90,
      }}
    >
      <ErrorOutlinedIcon
        fontSize="small"
        titleAccess={t("txn.status.failedToExecute")}
        sx={{color: errorColor}}
      />
      <Typography variant="body2" sx={{color: errorColor}}>
        {t("txn.status.fail")}
      </Typography>
    </Stack>
  );
});

// Memoized since rendered many times in transaction tables
export const TableTransactionStatus = memo(function TableTransactionStatus({
  success,
}: TransactionStatusProps) {
  const {t} = useTranslation();
  return success ? null : (
    <Box sx={tableStatusStyle}>
      <PriorityHighOutlinedIcon
        sx={iconStyle}
        color="error"
        titleAccess={t("txn.status.failedToExecute")}
      />
    </Box>
  );
});
