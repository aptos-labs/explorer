import {useMediaQuery, useTheme} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import type React from "react";

type SideDrawerProps = {
  children: React.ReactNode;
  open: boolean;
  toggleSideDrawer: () => void;
};

export default function SideDrawer({
  children,
  open,
  toggleSideDrawer,
}: SideDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Drawer
      sx={{
        width: isMobile ? "80%" : "33%",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? "80%" : "33%",
        },
      }}
      open={open}
      onClose={toggleSideDrawer}
      anchor="right"
    >
      {children}
    </Drawer>
  );
}
