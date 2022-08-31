import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import React from "react";
import {LinkBaseProps, LinkProps} from "@mui/material/Link/Link";

export default function AccountLink({
  address,
  hideAccount,
  ...props
}: {address: string; hideAccount?: boolean} & LinkBaseProps & LinkProps) {
  return (
    <Link
      key={address}
      component={RRD.Link}
      to={`/account/${address}`}
      {...props}
    >
      {!hideAccount && "Account "}
      {address}
    </Link>
  );
}
