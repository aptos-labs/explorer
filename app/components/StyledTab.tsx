import * as React from "react";
import {Tab, TabProps, useTheme} from "@mui/material";

interface StyledTabProps extends TabProps {
  isFirst: boolean;
  isLast: boolean;
  secondary?: boolean; // some page has multiple levels of tabs, the style would be different.
}

export default function StyledTab({
  isFirst,
  isLast,
  secondary,
  ...props
}: StyledTabProps) {
  const theme = useTheme();
  let backgroundColor;
  if (!secondary) {
    backgroundColor = theme.palette.background.paper;
  } else {
    backgroundColor =
      theme.palette.mode === "dark"
        ? theme.palette.neutralShade.lighter
        : theme.palette.neutralShade.darker;
  }

  return (
    <Tab
      sx={{
        minHeight: 60,
        textTransform: "none",
        fontSize: {xs: "small", md: "medium"},
        paddingX: 3,
        color: theme.palette.text.secondary,
        minWidth: {xs: 0, md: "200px"},
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
      }}
      iconPosition="start"
      disableRipple
      {...props}
    />
  );
}
