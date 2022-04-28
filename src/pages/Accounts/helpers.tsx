import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import React from "react";
import {LinkBaseProps, LinkProps} from "@mui/material/Link/Link";

export function AccountLink({
  address,
  hideAccount,
  ...props
}: {address: string; hideAccount?: boolean} & LinkBaseProps & LinkProps) {
  return (
    <Link
      key={address}
      component={RRD.Link}
      to={`/account/${address}`}
      color="inherit"
      underline="none"
      {...props}
    >
      {!hideAccount && "Account "}
      {address}
    </Link>
  );
}
