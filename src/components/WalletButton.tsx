import {truncateAddress, useWallet} from "@aptos-labs/wallet-adapter-react";
// import {AccountBalanceWalletOutlined as AccountBalanceWalletOutlinedIcon} from "@mui/icons-material";
import {Avatar, Button, Typography} from "@mui/material";
import React, {useState, JSX} from "react";
import WalletMenu from "./WalletMenu";

type WalletButtonProps = {
  handleModalOpen: () => void;
  handleNavigate?: () => void;
};

export default function WalletButton({
  handleModalOpen,
  handleNavigate,
}: WalletButtonProps): JSX.Element {
  const {connected, account, wallet} = useWallet();

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
        sx={{
          borderRadius: "8px 16px 4px 18px",
          padding: "8px 24px",
          backgroundColor: "#FFD337",
          color: "#000",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#E6BE32",
          },
          height: "40px",
        }}
      >
        {connected ? (
          <>
            <Avatar
              alt={wallet?.name}
              src={wallet?.icon}
              sx={{width: 24, height: 24}}
            />
            <Typography noWrap ml={2}>
              {account?.ansName ||
                truncateAddress(account?.address) ||
                "Unknown"}
            </Typography>
          </>
        ) : (
          <>
            {/* <AccountBalanceWalletOutlinedIcon sx={{marginRight: 1}} /> */}
            <Typography
              noWrap
              sx={{fontWeight: 600, fontSize: "18px", lineHeight: "28.07px"}}
            >
              Connect Wallet
            </Typography>
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
