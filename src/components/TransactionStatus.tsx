import React from "react";
import {Box, Stack, Typography, useTheme, alpha} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";

type TransactionStatusProps = {
  success: boolean;
};

export function TransactionStatus({success}: TransactionStatusProps) {
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
}

export function TableTransactionStatus({success}: TransactionStatusProps) {
  return success ? null : (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <PriorityHighOutlinedIcon
        sx={{fontSize: "inherit"}}
        color="error"
        titleAccess="Failed to Execute"
      />
    </Box>
  );
}
