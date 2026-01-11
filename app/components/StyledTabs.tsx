import React from "react";
import {Tabs, TabsProps, useMediaQuery, useTheme} from "@mui/material";

interface StyledTabsProps extends TabsProps {
  children: React.ReactNode;
}

export default function StyledTabs({children, ...props}: StyledTabsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Tabs
      variant="scrollable"
      scrollButtons={isMobile ? true : "auto"}
      allowScrollButtonsMobile
      sx={{
        "& .MuiTabs-indicator": {
          display: "none",
        },
        // Show scroll buttons on mobile for better discoverability
        "& .MuiTabs-scrollButtons": {
          opacity: 1,
          "&.Mui-disabled": {
            opacity: 0.3,
          },
        },
        // Improve scroll button visibility on mobile
        "& .MuiTabScrollButton-root": {
          width: {xs: 32, md: 40},
          color: theme.palette.text.secondary,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
        // Ensure proper alignment for mobile tabs container
        "& .MuiTabs-flexContainer": {
          gap: 0,
        },
      }}
      {...props}
    >
      {children}
    </Tabs>
  );
}
