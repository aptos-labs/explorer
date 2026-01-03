import React, {useState} from "react";
import {parseTimestampString} from "../../../pages/utils";
import EmptyValue from "./EmptyValue";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {IconButton, Stack, Typography, useTheme} from "@mui/material";
import StyledTooltip from "../../StyledTooltip";

const TOOLTIP_TIME = 2000; // 2s

type TimestampValueProps = {
  ensureMilliSeconds: boolean;
  timestamp: string;
};

export default function TimestampValue({
  ensureMilliSeconds,
  timestamp,
}: TimestampValueProps) {
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const theme = useTheme();
  const color = theme.palette.text.secondary;

  if (timestamp === "0") {
    return <EmptyValue />;
  }

  const timestamp_display = parseTimestampString(timestamp, ensureMilliSeconds);

  const copyTimestamp = async () => {
    await navigator.clipboard.writeText(timestamp);

    setTooltipOpen(true);

    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography fontSize="inherit">{timestamp_display}</Typography>
      <StyledTooltip
        title="Timestamp copied"
        placement="right"
        open={tooltipOpen}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <IconButton onClick={copyTimestamp} sx={{padding: 0.6}}>
          <ContentCopyIcon sx={{color: color, fontSize: 15}} />
        </IconButton>
      </StyledTooltip>
    </Stack>
  );
}
