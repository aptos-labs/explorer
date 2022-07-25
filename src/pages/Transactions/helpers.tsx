import React from "react";
import Typography from "@mui/material/Typography";
import {parseTimestamp, timestampDisplay} from "../utils";
import NumberFormat from "react-number-format";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import Title from "../../components/Title";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

export function renderTimestamp(timestamp?: string) {
  if (!timestamp)
    return (
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  const moment = parseTimestamp(timestamp);
  const timestamp_display = timestampDisplay(moment);

  return <>{timestamp_display.local_formatted}</>;
}

export function renderGas(gas: string) {
  return <NumberFormat value={gas} displayType="text" thousandSeparator />;
}

export function renderSuccess(success: boolean) {
  if (success)
    return (
      <CheckCircleOutlinedIcon
        fontSize="medium"
        color="success"
        titleAccess="Executed successfully"
      />
    );

  return (
    <ErrorOutlineOutlinedIcon
      fontSize="medium"
      color="error"
      titleAccess="Failed to Execute"
    />
  );
}

export function renderTransactionType(transaction_type: string) {
  switch (transaction_type) {
    case "block_metadata_transaction":
      return "BlockMetadata";
    case "genesis_transaction":
      return "GenesisTransaction";
    case "user_transaction":
      return "UserTransaction";
    case "pending_transaction":
      return "PendingTransaction";
    case "state_checkpoint_transaction":
      return "StateCheckpointTransaction";
    default:
      throw `Unknown renderTransactionType:${transaction_type}`;
  }
}

export function renderSection(
  children: React.ReactNode,
  title: React.ReactNode,
) {
  return (
    <Stack direction="column" spacing={4} sx={{mb: 6}}>
      <Title>{title}</Title>
      {children}
    </Stack>
  );
}

export function renderRow(
  key: React.ReactNode,
  value: React.ReactNode,
  i?: any,
) {
  return (
    <Box>
      <Grid
        container
        direction={{xs: "column", md: "row"}}
        rowSpacing={1}
        columnSpacing={4}
        key={i}
      >
        <Grid item md={3}>
          <Typography variant="subtitle1">{key}</Typography>
        </Grid>
        <Grid item md={9} sx={{width: 1, overflowWrap: "break-word"}}>
          <Box>{value}</Box>
        </Grid>
      </Grid>
    </Box>
  );
}
