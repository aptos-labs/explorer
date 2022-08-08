import React from "react";
import moment from "moment";
import Box from "@mui/material/Box";
import {useTheme} from "@mui/material";
import {AptosClient, AptosAccount, HexString} from "aptos";

export function renderDebug(data: any) {
  const theme = useTheme();
  return (
    <Box
      sx={{overflow: "auto", fontWeight: theme.typography.fontWeightRegular}}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data || null, null, 2)
          .replaceAll("\n", "<br/>")
          .replaceAll(" ", "&nbsp;"),
      }}
    ></Box>
  );
}

export function ensureMillisecondTimestamp(timestamp: string): number {
  /*
  Could be: 1646458457
        or: 1646440953658538
   */
  if (timestamp.length > 13) {
    timestamp = timestamp.slice(0, 13);
  }
  if (timestamp.length == 10) {
    timestamp = timestamp + "000";
  }
  return parseInt(timestamp);
}

export function parseTimestamp(timestamp: string): moment.Moment {
  return moment(ensureMillisecondTimestamp(timestamp));
}

export interface TimestampDisplay {
  formatted: string;
  local_formatted: string;
  formatted_time_delta: string;
}

export function timestampDisplay(timestamp: moment.Moment): TimestampDisplay {
  return {
    formatted: timestamp.format("MM/DD/YY HH:mm:ss [UTC]"),
    local_formatted: timestamp.local().format("D MMM YYYY HH:mm:ss"),
    formatted_time_delta: timestamp.fromNow(),
  };
}

export function getTimeRemaining(endtime: string) {
  const total = ensureMillisecondTimestamp(endtime) - Date.now();
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
  };
}

export function getHexString(str: string): string {
  return HexString.fromUint8Array(new TextEncoder().encode(str)).hex();
}

export async function doTransaction(
  account: AptosAccount,
  client: AptosClient,
  payload: any,
) {
  const txnRequest = await client.generateTransaction(
    account.address(),
    payload,
  );
  const signedTxn = await client.signTransaction(account, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(transactionRes.hash);
  return transactionRes;
}

function truncateMiddle(
  str: string,
  frontLen: number,
  backLen: number,
  truncateStr: string,
) {
  if (str === null) {
    return "";
  }

  if (!Number.isInteger(frontLen) || !Number.isInteger(backLen)) {
    throw `${frontLen} and ${backLen} should be an Integer`;
  }

  var strLen = str.length;
  // Setting default values
  frontLen = frontLen;
  backLen = backLen;
  truncateStr = truncateStr || "…";
  if (
    (frontLen === 0 && backLen === 0) ||
    frontLen >= strLen ||
    backLen >= strLen ||
    frontLen + backLen >= strLen
  ) {
    return str;
  } else if (backLen === 0) {
    return str.slice(0, frontLen) + truncateStr;
  } else {
    return str.slice(0, frontLen) + truncateStr + str.slice(strLen - backLen);
  }
}

export function truncateAddress(accountAddress: string) {
  return truncateMiddle(accountAddress, 4, 4, "…");
}

export function isHex (text: string) {
  // if it's hex, and is <= (64 + 2 for 0x) char long
  return text.startsWith("0x") && text.length <= 66
}