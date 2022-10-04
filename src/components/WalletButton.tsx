import React from "react";

import {
  Button,
  ButtonBaseProps,
  ButtonProps,
  Link,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {useWalletContext} from "../context/wallet/context";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AddCardIcon from "@mui/icons-material/AddCard";
import ErrorIcon from "@mui/icons-material/Error";
import {truncateAddress} from "../pages/utils";
import {isUpdatedVersion} from "../api/wallet";
import {primary, grey} from "../themes/colors/aptosColorPalette";
import {installWalletUrl} from "../constants";

type WalletButtonWrapperProps = {
  children?: React.ReactNode;
  icon?: JSX.Element;
  text: string | null;
};

const WalletButtonWrapper = ({
  children,
  text,
  icon,
  ...props
}: WalletButtonWrapperProps & ButtonBaseProps & ButtonProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Button
      variant="outlined"
      sx={{
        padding: "10px 25px",
        backgroundColor: theme.palette.mode === "dark" ? grey[800] : "white",
        color: theme.palette.mode === "dark" ? primary[400] : grey[900],
      }}
      {...props}
    >
      {icon}
      <Typography
        variant="body2"
        color={theme.palette.mode === "dark" ? "white" : grey[900]}
        ml={2}
      >
        {text}
      </Typography>
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
      Wallet extension.
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
  const {isInstalled, isConnected, isAccountSet, connect, accountAddress} =
    useWalletContext();

  if (!isInstalled) {
    return (
      <Tooltip
        title={
          <Link href={installWalletUrl} target="_blank">
            Please install the Aptos wallet
          </Link>
        }
      >
        <span>
          <WalletButtonWrapper disabled text="install Wallet" />
        </span>
      </Tooltip>
    );
  }

  const isWalletLatestVersion = isUpdatedVersion();

  return (
    <>
      {isInstalled && !isAccountSet && (
        <Tooltip title="Use the Wallet extension to create an account">
          <span>
            <WalletButtonWrapper
              text="create an account"
              icon={<AddCardIcon />}
              sx={{cursor: "default"}}
            >
              {!isWalletLatestVersion && <OldWalletVersionWarning />}
            </WalletButtonWrapper>
          </span>
        </Tooltip>
      )}
      {isInstalled && isAccountSet && !isConnected && (
        <WalletButtonWrapper
          onClick={connect}
          text="Connect Wallet"
          icon={<CreditCardIcon />}
        >
          {!isWalletLatestVersion && <OldWalletVersionWarning />}
        </WalletButtonWrapper>
      )}
      {isInstalled && isConnected && (
        <WalletButtonWrapper
          text={accountAddress && truncateAddress(accountAddress)}
          icon={<CreditCardIcon />}
        >
          {!isWalletLatestVersion && <OldWalletVersionWarning />}
        </WalletButtonWrapper>
      )}
    </>
  );
};
