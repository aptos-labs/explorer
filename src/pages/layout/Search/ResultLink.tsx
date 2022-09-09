import React from "react";
import {Link} from "@mui/material";
import * as RRD from "react-router-dom";

type ResultLinkProps = {
  to: string;
  text: string;
};

export default function ResultLink({to, text}: ResultLinkProps): JSX.Element {
  return (
    <Link
      component={RRD.Link}
      to={to}
      color="inherit"
      underline="none"
      sx={{
        padding: 0.5,
        display: "block",
        width: "100%",
        "&:hover": {
          backgroundColor: `${"transparent"}!important`,
          opacity: "0.8",
        },
      }}
    >
      {text}
    </Link>
  );
}
