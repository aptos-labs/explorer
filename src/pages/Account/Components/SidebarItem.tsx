import React from "react";
import {Box, useTheme} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
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
          loggingInfo &&
            logEvent(
              loggingInfo.eventName,
              loggingInfo.value,
              loggingInfo.metadata,
            );
        }}
        sx={{
          fontSize: 12,
          fontWeight: selected ? 600 : 400,
          padding: "8px",
          borderRadius: 1,
          bgcolor: !selected
            ? "transparent"
            : theme.palette.mode === "dark"
            ? grey[500]
            : grey[200],
          ...(theme.palette.mode === "dark" && !selected && {color: grey[400]}),
          ":hover": {
            cursor: "pointer",
            ...(theme.palette.mode === "dark" &&
              !selected && {color: grey[200]}),
          },
        }}
      >
        {name}
      </Box>
    </Link>
  );
}
