import React from "react";
import moment from "moment";
import Box from "@mui/material/Box";
import {useTheme} from "@mui/material";

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

function ensureMillisecondTimestamp(timestamp: string): number {
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

export function getTimeRemaining(endtime: number) {
  const total = endtime - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}
