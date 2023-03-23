import {Stack, Typography, useTheme} from "@mui/material";
import React from "react";
import {grey} from "../themes/colors/aptosColorPalette";
import Countdown from "react-countdown";

const BAR_COLOR = "#818CF8";
const BAR_BACKGROUND_COLOR = "rgb(129, 140, 248, 0.4)";

export enum IntervalType {
  EPOCH = "EPOCH",
  UNLOCK_COUNTDOWN = "UNLOCK_COUNTDOWN",
}

type IntervalBarProps = {
  percentage: number;
  timestamp: number;
  intervalType: IntervalType;
};

export default function IntervalBar({
  percentage,
  timestamp,
  intervalType,
}: IntervalBarProps) {
  const theme = useTheme();
  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed && intervalType === IntervalType.EPOCH) {
      window.location.reload();
    }
    switch (intervalType) {
      case IntervalType.EPOCH:
        return (
          <span>
            {hours}h {minutes}m {seconds}s
          </span>
        );
      case IntervalType.UNLOCK_COUNTDOWN:
        return (
          <span>
            {days}d {hours}h {minutes}m {seconds}s
          </span>
        );
    }
  };

  return (
    <Stack direction="row" width={182} height={16}>
      <Stack
        width={`${percentage}%`}
        sx={{
          backgroundColor: BAR_COLOR,
          borderRadius:
            percentage < 100 ? "4px 0px 0px 4px" : "4px 4px 4px 4px",
        }}
        justifyContent="center"
      >
        {percentage >= 50 && (
          <Typography
            color={grey[50]}
            sx={{fontSize: 10, fontWeight: 600}}
            marginX={0.5}
          >
            <Countdown date={timestamp} renderer={renderer} />
          </Typography>
        )}
      </Stack>
      <Stack
        width={`${100 - percentage}%`}
        sx={{
          backgroundColor: BAR_BACKGROUND_COLOR,
          borderRadius: percentage > 0 ? "0px 4px 4px 0px" : "4px 4px 4px 4px",
        }}
        alignItems="flex-end"
        justifyContent="center"
      >
        {percentage < 50 && (
          <Typography
            color={theme.palette.mode === "dark" ? grey[50] : grey[500]}
            sx={{fontSize: 10, fontWeight: 600}}
            marginX={0.5}
          >
            <Countdown date={timestamp} renderer={renderer} />
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
