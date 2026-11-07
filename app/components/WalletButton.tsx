import {AccountBalanceWalletOutlined as AccountBalanceWalletOutlinedIcon} from "@mui/icons-material";
import {Avatar, Button, Typography} from "@mui/material";
import type React from "react";
import {type JSX, useState} from "react";
import {useWallet} from "../context/wallet-adapter";
import {useTranslation} from "../i18n";
import WalletMenu from "./WalletMenu";

function truncateAddress(address?: string) {
  if (!address) return;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
}

type WalletButtonProps = {
  handleModalOpen: () => void;
  handleNavigate?: () => void;
};

export default function WalletButton({
  handleModalOpen,
  handleNavigate,
}: WalletButtonProps): JSX.Element {
  const {connected, account, wallet} = useWallet();
  const {t} = useTranslation();

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLButtonElement | null>(
    null,
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
  };

  const onConnectWalletClick = () => {
    handlePopoverClose();
    handleModalOpen();
  };

  return (
    <>
      <Button
        size="large"
        variant="contained"
        onClick={connected ? handleClick : onConnectWalletClick}
        className="wallet-button"
        sx={{borderRadius: "10px"}}
      >
        {connected ? (
          <>
            <Avatar
              alt={wallet?.name}
              src={wallet?.icon}
              sx={{width: 24, height: 24}}
            />
            <Typography
              noWrap
              sx={{
                ml: 2,
              }}
            >
              {account?.ansName ||
                truncateAddress(account?.address?.toString()) ||
                t("common.unknown")}
            </Typography>
          </>
        ) : (
          <>
            <AccountBalanceWalletOutlinedIcon sx={{marginRight: 1}} />
            <Typography noWrap>{t("wallet.connect")}</Typography>
          </>
        )}
      </Button>
      <WalletMenu
        popoverAnchor={popoverAnchor}
        handlePopoverClose={handlePopoverClose}
        handleNavigate={handleNavigate}
      />
    </>
  );
}
