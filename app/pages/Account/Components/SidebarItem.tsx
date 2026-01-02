import React from "react";
import {Box, useTheme} from "@mui/material";
import {Link} from "../../../routing";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";

interface SidebarItemProps {
  linkTo: string;
  selected: boolean;
  name: string;
  loggingInfo?: {
    eventName: string;
    value: string;
    metadata?: Record<string, string>;
  };
}

// The item on the sidebar
export default function SidebarItem({
  selected,
  name,
  linkTo,
  loggingInfo,
}: SidebarItemProps) {
  const theme = useTheme();
  const logEvent = useLogEventWithBasic();

  return (
    <Link to={linkTo} underline="none" color={"inherit"}>
      <Box
        onClick={() => {
          if (loggingInfo) {
            logEvent(
              loggingInfo.eventName,
              loggingInfo.value,
              loggingInfo.metadata,
            );
          }
        }}
        sx={{
          fontSize: 14,
          fontWeight: selected ? 600 : 400,
          padding: "8px",
          borderRadius: 1,
          bgcolor: !selected
            ? "transparent"
            : theme.palette.mode === "dark"
              ? theme.palette.neutralShade.lighter
              : theme.palette.neutralShade.darker,
          ...(theme.palette.mode === "dark" &&
            !selected && {color: theme.palette.text.secondary}),
          ":hover": {
            cursor: "pointer",
            ...(theme.palette.mode === "dark" &&
              !selected && {color: theme.palette.text.primary}),
          },
        }}
      >
        {name}
      </Box>
    </Link>
  );
}
