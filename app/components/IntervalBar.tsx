import {alpha, Stack, Typography, useTheme} from "@mui/material";
import {memo, useCallback, useEffect, useRef, useState} from "react";
import StyledTooltip from "./StyledTooltip";

export enum IntervalType {
  EPOCH = "EPOCH",
  UNLOCK_COUNTDOWN = "UNLOCK_COUNTDOWN",
}

type IntervalBarProps = {
  percentage: number;
  timestamp: number;
  intervalType: IntervalType;
};

// Extracted static styles
const typographyStyle = {fontSize: 10, fontWeight: 600} as const;

function useCountdown(targetDate: number) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, targetDate - Date.now()),
  );
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetDate - Date.now());
      setRemaining(diff);
      if (diff <= 0 && rafRef.current) {
        clearInterval(rafRef.current);
        rafRef.current = null;
      }
    };
    // Reset immediately when targetDate changes to avoid showing stale values
    tick();
    rafRef.current = setInterval(tick, 1000);
    return () => {
      if (rafRef.current) clearInterval(rafRef.current);
    };
  }, [targetDate]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {days, hours, minutes, seconds, completed: remaining <= 0};
}

const IntervalBar = memo(function IntervalBar({
  percentage,
  timestamp,
  intervalType,
}: IntervalBarProps) {
  const theme = useTheme();
  const {days, hours, minutes, seconds, completed} = useCountdown(timestamp);
  const displayTooltip = completed;

  const barColor = theme.palette.primary.main;
  const barBackgroundColor = alpha(theme.palette.primary.main, 0.4);

  const renderTime = useCallback(() => {
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
            {days >= 10
              ? `${days}d ${hours}h ${minutes}m`
              : `${days}d ${hours}h ${minutes}m ${seconds}s`}
          </span>
        );
    }
  }, [intervalType, days, hours, minutes, seconds]);

  const intervalBar = (
    <Stack direction="row" sx={{width: 182, height: 16}}>
      <Stack
        sx={{
          width: `${percentage}%`,
          backgroundColor: barColor,
          borderRadius:
            percentage < 100 ? "4px 0px 0px 4px" : "4px 4px 4px 4px",
          justifyContent: "center",
        }}
      >
        {percentage >= 50 && (
          <Typography
            color={theme.palette.common.white}
            sx={{...typographyStyle, marginX: 0.5}}
          >
            {renderTime()}
          </Typography>
        )}
      </Stack>
      <Stack
        sx={{
          width: `${100 - percentage}%`,
          backgroundColor: barBackgroundColor,
          borderRadius: percentage > 0 ? "0px 4px 4px 0px" : "4px 4px 4px 4px",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {percentage < 50 && (
          <Typography
            color={theme.palette.text.secondary}
            sx={{...typographyStyle, marginX: 0.5}}
          >
            {renderTime()}
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
    intervalBar
  );
});

export default IntervalBar;
