import React from "react";
import {NavLink} from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function Nav() {
  return (
    <Box
      sx={{
        display: {xs: "none", sm: "flex"},
        alignItems: "center",
        gap: {sm: 2, md: 4, lg: 8},
        marginRight: {sm: "1rem", md: "2rem", lg: "3.5rem"},
      }}
    >
      <Button
        variant="nav"
        component={NavLink}
        to="/staking"
        title="Staking"
        sx={{
          color: "inherit",
          fontSize: {sm: ".875rem", md: "1rem"},
        }}
      >
        Staking
      </Button>
    </Box>
  );
}
