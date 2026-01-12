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

  // On mobile: show only icon if available, otherwise show compact label
  const hasIcon = props.icon !== undefined;
  const showLabelOnMobile = !hasIcon;
  const mobileLabel = showLabelOnMobile ? label : undefined;

  const tabElement = (
    <Tab
      sx={{
        minHeight: {xs: 48, md: 60},
        textTransform: "none",
        fontSize: {xs: "small", md: "medium"},
        paddingX: {xs: showLabelOnMobile ? 2 : 1.5, md: 3},
        color: theme.palette.text.secondary,
        minWidth: {xs: showLabelOnMobile ? "auto" : 48, md: "200px"},
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
      // Hide label on mobile when icon is available, show only icons for compact view
      label={isMobile ? mobileLabel : label}
      {...props}
    />
  );

  // On mobile with icon, wrap in tooltip to show label on hover/tap
  // Note: label should be a string or simple content for proper tooltip rendering
  if (isMobile && hasIcon && label) {
    return (
      <Tooltip title={label} arrow enterTouchDelay={0} leaveTouchDelay={1500}>
        {tabElement}
      </Tooltip>
    );
  }

  return tabElement;
}
