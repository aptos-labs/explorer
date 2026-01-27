import {Stack, Typography, useTheme, alpha} from "@mui/material";
import React, {useState, useCallback, memo, useEffect} from "react";
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

const IntervalBar = memo(function IntervalBar({
  percentage,
  timestamp,
  intervalType,
}: IntervalBarProps) {
  const theme = useTheme();
  const [displayTooltip, setDisplayTooltip] = useState<boolean>(false);
  const [Countdown, setCountdown] = useState<React.ComponentType<
    Record<string, unknown>
  > | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Only load react-countdown on client side to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
    import("react-countdown").then((module) => {
      setCountdown(
        module.default as unknown as React.ComponentType<
          Record<string, unknown>
        >,
      );
    });
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setDisplayTooltip(true);
  }, []);

  const barColor = theme.palette.primary.main;
  const barBackgroundColor = alpha(theme.palette.primary.main, 0.4);

  // Memoize renderer to avoid recreation on every render
  const renderer = useCallback(
    ({
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
              {days >= 10
                ? `${days}d ${hours}h ${minutes}m`
                : `${days}d ${hours}h ${minutes}m ${seconds}s`}
            </span>
          );
      }
    },
    [intervalType],
  );

  const intervalBar = (
    <Stack direction="row" width={182} height={16}>
      <Stack
        width={`${percentage}%`}
        sx={{
          backgroundColor: barColor,
          borderRadius:
            percentage < 100 ? "4px 0px 0px 4px" : "4px 4px 4px 4px",
        }}
        justifyContent="center"
      >
        {percentage >= 50 && (
          <Typography
            color={theme.palette.common.white}
            sx={typographyStyle}
            marginX={0.5}
          >
            {isClient && Countdown ? (
              <Countdown
                date={timestamp}
                renderer={renderer}
                onComplete={handleCountdownComplete}
              />
            ) : (
              <span>--</span>
            )}
          </Typography>
        )}
      </Stack>
      <Stack
        width={`${100 - percentage}%`}
        sx={{
          backgroundColor: barBackgroundColor,
          borderRadius: percentage > 0 ? "0px 4px 4px 0px" : "4px 4px 4px 4px",
        }}
        alignItems="flex-end"
        justifyContent="center"
      >
        {percentage < 50 && (
          <Typography
            color={theme.palette.text.secondary}
            sx={typographyStyle}
            marginX={0.5}
          >
            {isClient && Countdown ? (
              <Countdown
                date={timestamp}
                renderer={renderer}
                onComplete={handleCountdownComplete}
              />
            ) : (
              <span>--</span>
            )}
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
});

export default IntervalBar;
