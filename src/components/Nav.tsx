import * as React from "react";
import {NavLink} from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function Nav() {
  return (
    <Box
      sx={{
        display: {xs: "none", md: "flex"},
        alignItems: "center",
        gap: 2,
        marginRight: "1.5rem",
      }}
    >
      <Button
        variant="nav"
        component={NavLink}
        to="/transactions"
        sx={{color: "inherit"}}
      >
        Transactions
      </Button>

      <Button
        variant="nav"
        component={NavLink}
        to="/proposals"
        sx={{color: "inherit"}}
      >
        Governance
      </Button>
    </Box>
  );
}
