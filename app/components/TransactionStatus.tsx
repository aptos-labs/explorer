import React, {memo} from "react";
import {Box, Stack, Typography, useTheme, alpha} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";

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
  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;
  const successBackgroundColor = alpha(successColor, 0.1);
  const errorBackgroundColor = alpha(errorColor, 0.1);

  return success ? (
    <Stack
      direction="row"
      spacing={1}
      paddingY={0.7}
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundColor: successBackgroundColor,
        width: 114,
      }}
      borderRadius={1}
    >
      <CheckCircleIcon
        fontSize="small"
        titleAccess="Executed successfully"
        sx={{color: successColor}}
      />
      <Typography variant="body2" sx={{color: successColor}}>
        Success
      </Typography>
    </Stack>
  ) : (
    <Stack
      direction="row"
      spacing={1}
      paddingY={0.7}
      alignItems="center"
      justifyContent="center"
      sx={{
        backgroundColor: errorBackgroundColor,
        width: 90,
      }}
      borderRadius={1}
    >
      <ErrorOutlinedIcon
        fontSize="small"
        titleAccess="Failed to Execute"
        sx={{color: errorColor}}
      />
      <Typography variant="body2" sx={{color: errorColor}}>
        Fail
      </Typography>
    </Stack>
  );
});

// Memoized since rendered many times in transaction tables
export const TableTransactionStatus = memo(function TableTransactionStatus({
  success,
}: TransactionStatusProps) {
  return success ? null : (
    <Box sx={tableStatusStyle}>
      <PriorityHighOutlinedIcon
        sx={iconStyle}
        color="error"
        titleAccess="Failed to Execute"
      />
    </Box>
  );
});
