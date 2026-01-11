import * as React from "react";
import {Tab, TabProps, Tooltip, useMediaQuery, useTheme} from "@mui/material";

interface StyledTabProps extends TabProps {
  isFirst: boolean;
  isLast: boolean;
  secondary?: boolean; // some page has multiple levels of tabs, the style would be different.
}

export default function StyledTab({
  isFirst,
  isLast,
  secondary,
  label,
  ...props
}: StyledTabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  let backgroundColor;
  if (!secondary) {
    backgroundColor = theme.palette.background.paper;
  } else {
    backgroundColor =
      theme.palette.mode === "dark"
        ? theme.palette.neutralShade.lighter
        : theme.palette.neutralShade.darker;
  }

  const tabElement = (
    <Tab
      sx={{
        minHeight: {xs: 48, md: 60},
        textTransform: "none",
        fontSize: {xs: "small", md: "medium"},
        paddingX: {xs: 1.5, md: 3},
        color: theme.palette.text.secondary,
        minWidth: {xs: 48, md: "200px"},
        "&.Mui-selected": {
          color: "inherit",
          backgroundColor: backgroundColor,
        },
        borderTopLeftRadius: isFirst ? "15px 15px" : "",
        borderBottomLeftRadius: isFirst ? "15px 15px" : "",
        borderTopRightRadius: isLast ? "15px 15px" : "",
        borderBottomRightRadius: isLast ? "15px 15px" : "",
        border: 1,
        borderColor: backgroundColor,
        flexGrow: {xs: 1, md: 0},
        // On mobile, center the icon when no label is shown
        "& .MuiTab-iconWrapper": {
          marginRight: {xs: 0, md: 1},
        },
      }}
      iconPosition="start"
      disableRipple
      // Hide label on mobile, show only icons for compact view
      label={isMobile ? undefined : label}
      {...props}
    />
  );

  // On mobile, wrap in tooltip to show label on hover/tap
  if (isMobile && label) {
    return (
      <Tooltip title={label} arrow enterTouchDelay={0} leaveTouchDelay={1500}>
        {tabElement}
      </Tooltip>
    );
  }

  return tabElement;
}
