import React from "react";

import {
  Box,
  Button,
  ButtonBaseProps,
  ButtonProps,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {useWalletContext} from "../context/wallet/context";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ErrorIcon from "@mui/icons-material/Error";
import {truncateAddress} from "../pages/utils";
import {isUpdatedVersion} from "../api/wallet";

type WalletButtonWrapperProps = {
  children: React.ReactNode;
};

const WalletButtonWrapper = ({
  children,
  ...props
}: WalletButtonWrapperProps & ButtonBaseProps & ButtonProps): JSX.Element => {
  return (
    <Button
      variant="outlined"
      sx={{padding: "10px 25px", backgroundColor: "#1B1F1E"}}
      {...props}
    >
      {children}
    </Button>
  );
};

const OldWalletVersionWarning = (): JSX.Element => {
  const warningText = (
    <Link
      href="https://github.com/aptos-labs/aptos-core/releases/"
      target="_blank"
    >
      You are using an old wallet version, please install the latest Aptos
      Wallet extension for better support
    </Link>
  );
  return (
    <Tooltip title={warningText}>
      <Stack ml={1}>
        <ErrorIcon />
      </Stack>
    </Tooltip>
  );
};

export const WalletButton = (): JSX.Element => {
  const {isInstalled, isConnected, connect, accountAddress} =
    useWalletContext();

  if (!isInstalled) {
    return (
      <Tooltip
        title={
          <Link
            href="https://aptos.dev/guides/building-wallet-extension"
            target="_blank"
          >
            Please install the Aptos wallet
          </Link>
        }
      >
        <span>
          <WalletButtonWrapper disabled>
            <Typography variant="body2" color="white">
              Connect Wallet
            </Typography>
          </WalletButtonWrapper>
        </span>
      </Tooltip>
    );
  }

  const isWalletLatestVersion = isUpdatedVersion();

  return (
    <>
      {isInstalled && !isConnected && (
        <WalletButtonWrapper onClick={connect}>
          <CreditCardIcon />
          <Typography variant="body2" color="white" ml={2}>
            Connect Wallet
          </Typography>
          {!isWalletLatestVersion && <OldWalletVersionWarning />}
        </WalletButtonWrapper>
      )}
      {isInstalled && isConnected && (
        <WalletButtonWrapper>
          <CreditCardIcon />
          <Typography variant="body2" color="white" ml={2}>
            {accountAddress && truncateAddress(accountAddress)}
          </Typography>
          {!isWalletLatestVersion && <OldWalletVersionWarning />}
        </WalletButtonWrapper>
      )}
    </>
  );
};
