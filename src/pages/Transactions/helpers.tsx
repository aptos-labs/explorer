import React from "react";
import Typography from "@mui/material/Typography";
import {parseTimestamp, timestampDisplay} from "../utils";
import NumberFormat from "react-number-format";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {useLocation} from "react-router-dom";
import Paper from "@mui/material/Paper";
import Title from "../../components/Title";
import Grid from "@mui/material/Grid";

export function useQuery() {
  const {search} = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function renderTimestamp(timestamp?: string) {
  if (!timestamp)
    return (
      <Typography
        variant="subtitle2"
        align="center">-</Typography>
    );

  const moment = parseTimestamp(timestamp);
  const timestamp_display = timestampDisplay(moment);

  return (
    <>
      {timestamp}
      <Typography
        variant="subtitle2">{timestamp_display.local_formatted} ({timestamp_display.formatted_time_delta})</Typography>
    </>
  );
}

export function renderGas(gas: string) {
  return (
    <NumberFormat
      value={gas}
      displayType="text"
      thousandSeparator
    />
  );
}

export function renderSuccess(success: boolean) {
  if (success)
    return (
      <CheckCircleOutlinedIcon
        fontSize="small"
        color="success"
        titleAccess="Success"
      />
    );

  return (
    <ErrorOutlineOutlinedIcon
      fontSize="small"
      color="error"
      titleAccess="Failure"
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
    default:
      throw `Unknown:${transaction_type}`;
  }
}

export function renderSection(children: React.ReactNode, title: React.ReactNode) {
  return (
    <Paper sx={{p: 2, display: "flex", flexDirection: "column", mb: 3}}>
      <Title>{title}</Title>
      {children}
    </Paper>
  );
}

export function renderRow(key: React.ReactNode, value: React.ReactNode, i?: any) {
  return (
    <Grid container key={i} sx={{overflowWrap: "break-word"}}>
      <Grid item xs={2}>
        {key}
      </Grid>
      <Grid item xs={1}/>
      <Grid item xs={8}>
        {value}
      </Grid>
    </Grid>
  );
}