import * as RRD from "react-router-dom";
import React from "react";

import {Link, Typography} from "@mui/material";

type HeaderTextProps = {
  walletIsConnected: boolean;
  accountAddress: string | null;
};

export const HeaderText = ({
  walletIsConnected,
  accountAddress,
}: HeaderTextProps) => {
  return (
    <>
      {walletIsConnected ? (
        <Typography variant="h5" noWrap sx={{mb: 2}}>
          Hello {""}
          <Link
            component={RRD.Link}
            to={`/account/${accountAddress}`}
            color="primary"
          >
            {accountAddress}
          </Link>
        </Typography>
      ) : (
        <Typography variant="h5" sx={{mb: 2}}>
          Aptos Governance
        </Typography>
      )}
      <Typography>
        Some instructions Some instructions Some instructions Some instructions
        Some instructions
      </Typography>
    </>
  );
};
