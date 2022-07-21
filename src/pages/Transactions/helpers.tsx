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
import StartRoundedIcon from '@mui/icons-material/StartRounded';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import SubtitlesOutlinedIcon from '@mui/icons-material/SubtitlesOutlined';
import MultipleStopRoundedIcon from '@mui/icons-material/MultipleStopRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

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
      <Box sx={{ display: "flex", alignItems: "center", gap:1}}>
      <CheckCircleOutlinedIcon
        fontSize="small"
        color="success"
        titleAccess="Executed successfully"
      />Success
      </Box>
    );

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <ErrorOutlineOutlinedIcon
      fontSize="small"
      color="error"
      titleAccess="Failed to Execute"
    />Fail
    </Box>
  );
}

export function renderTransactionType(transaction_type: string) {
  switch (transaction_type) {
    case "block_metadata_transaction":
      return (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><SubtitlesOutlinedIcon fontSize="small" color="primary" /><Typography fontSize="inherit">BlockMetadata</Typography></Box>);
    case "genesis_transaction":
      return (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><StartRoundedIcon fontSize="small" color="primary" /><Typography fontSize="inherit">GenesisTransaction</Typography></Box>);
    case "user_transaction":
      return (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><MultipleStopRoundedIcon fontSize="small" color="primary" /><Typography fontSize="inherit">UserTransaction</Typography></Box>);
    case "pending_transaction":
      return (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><UpdateRoundedIcon fontSize="small" color="primary" /><Typography fontSize="inherit">PendingTransaction</Typography></Box>);
    case "state_checkpoint_transaction":
      return (<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><OutlinedFlagIcon fontSize="small" color="primary" /><Typography fontSize="inherit">StateCheckpoint</Typography></Box>);
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
          <Typography variant="h6">{key}</Typography>
        </Grid>
        <Grid item md={9} sx={{width: 1, overflowWrap: "break-word"}}>
          <Box>{value}</Box>
        </Grid>
      </Grid>
    </Box>
  );
}
