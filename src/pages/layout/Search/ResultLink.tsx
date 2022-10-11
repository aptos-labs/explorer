import React from "react";
import {Link, Typography} from "@mui/material";
import * as RRD from "react-router-dom";

type ResultLinkProps = {
  to: string | null;
  text: string;
};

export default function ResultLink({to, text}: ResultLinkProps): JSX.Element {
  const style = {
    padding: 0.5,
    display: "block",
    width: "100%",
    "&:hover": {
      backgroundColor: `${"transparent"}!important`,
      opacity: "0.8",
    },
  };

  if (!to) {
    return (
      <Typography color="inherit" sx={style}>
        {text}
      </Typography>
    );
  }

  return (
    <Link
      component={RRD.Link}
      to={to}
      color="inherit"
      underline="none"
      sx={style}
    >
      {text}
    </Link>
  );
}
