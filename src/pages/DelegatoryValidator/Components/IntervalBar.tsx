import {Stack, Typography, useTheme} from "@mui/material";
import moment from "moment";
import React from "react";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {parseTimestamp, timestampDisplay} from "../../utils";
import {
  BAR_BACKGROUND_COLOR,
  BAR_COLOR,
} from "../../Validators/Components/Epoch";

export function IntervalBarTimeDuration({timestamp}: {timestamp: number}) {
  const theme = useTheme();

  // the beginning of the unlock cycle
  const startTime = parseTimestamp(timestamp.toString()).subtract(30, "days");

  // the end of the unlock cycle
  const unlockTime = parseTimestamp(timestamp.toString());

  // the remaining time of the unlock cycle
  const now = moment();
  const remainingTime = moment.duration(
    unlockTime.valueOf() - now.valueOf(),
    "milliseconds",
  );

  // the time already passed in the unlock cycle
  const alreadyPassedTime = moment.duration(
    now.valueOf() - startTime.valueOf(),
    "milliseconds",
  );

  const remainingTimeDisplay = timestampDisplay(
    moment(remainingTime.as("milliseconds")),
  );

  const percentage =
    (alreadyPassedTime.as("milliseconds") /
      (unlockTime.valueOf() - startTime.valueOf())) *
    100;

  return (
    <Stack direction="row" width={182} height={16}>
      <Stack
        width={`${percentage}%`}
        sx={{
          backgroundColor: BAR_COLOR,
          borderRadius:
            alreadyPassedTime.valueOf() < unlockTime.valueOf()
              ? "4px 0px 0px 4px"
              : "4px 4px 4px 4px",
        }}
        justifyContent="center"
      >
        {percentage < 50 && (
          <Typography
            color={grey[50]}
            sx={{fontSize: 10, fontWeight: 600}}
            marginX={0.5}
          >
            {remainingTimeDisplay.formatted_time_duration}
          </Typography>
        )}
      </Stack>
      <Stack
        width={`${100 - percentage}%`}
        sx={{
          backgroundColor: BAR_BACKGROUND_COLOR,
          borderRadius:
            remainingTime.valueOf() > 0 ? "0px 4px 4px 0px" : "4px 4px 4px 4px",
        }}
        alignItems="flex-end"
        justifyContent="center"
      >
        {percentage > 50 && (
          <Typography
            color={theme.palette.mode === "dark" ? grey[50] : grey[500]}
            sx={{fontSize: 10, fontWeight: 600}}
            marginX={0.5}
          >
            {remainingTimeDisplay.formatted_time_duration}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
