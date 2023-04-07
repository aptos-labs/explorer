import {Link as MuiLink} from "@mui/material";
import React from "react";
import {Link as RouterLink} from "react-router-dom";

export function Link({to, children}: {to: string; children: React.ReactNode}) {
  return (
    <MuiLink
      component={RouterLink}
      to={to}
      style={{textDecoration: "none", color: "inherit"}}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </MuiLink>
  );
}
