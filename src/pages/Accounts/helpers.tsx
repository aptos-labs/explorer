import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import React from "react";
import {LinkBaseProps, LinkProps} from "@mui/material/Link/Link";
import { useTheme } from '@mui/material';

export function AccountLink({
                              address,
                              hideAccount,
                              ...props
                            }: { address: string, hideAccount?: boolean } & LinkBaseProps & LinkProps) {

  const theme = useTheme();

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
