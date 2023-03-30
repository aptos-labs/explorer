import {Stack, Typography, useTheme} from "@mui/material";
import React, {useState} from "react";
import {grey} from "../themes/colors/aptosColorPalette";
import Countdown from "react-countdown";
import StyledTooltip from "./StyledTooltip";

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
  const [displayTooltip, setDisplayTooltip] = useState<boolean>(false);
  const handleCountdownComplete = () => {
    setDisplayTooltip(true);
  };

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }) => {
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

  const intervalBar = (
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
            <Countdown
              date={timestamp}
              renderer={renderer}
              onComplete={handleCountdownComplete}
            />
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
            <Countdown
              date={timestamp}
              renderer={renderer}
              onComplete={handleCountdownComplete}
            />
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  return displayTooltip ? (
    <StyledTooltip
      title="Please refresh the page to view the updated time remaining."
      placement="right"
    >
      {intervalBar}
    </StyledTooltip>
  ) : (
    <>{intervalBar}</>
  );
}
