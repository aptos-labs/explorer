import {Avatar, Button, Stack, Typography} from "@mui/material";
import {useState} from "react";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import WalletMenu from "./WalletMenu";
import React from "react";
import {truncateAddress} from "../../pages/utils";

type WalletButtonProps = {
  handleModalOpen: () => void;
};

export default function WalletButton({
  handleModalOpen,
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
    <Stack justifyContent="center" alignItems="center">
      {connected ? (
        <>
          <Button size="large" variant="contained" onClick={handleClick}>
            <Avatar
              alt={wallet?.name}
              src={wallet?.icon}
              sx={{width: 24, height: 24}}
            />
            <Typography ml={2}>{truncateAddress(account?.address!)}</Typography>
          </Button>
          <WalletMenu
            popoverAnchor={popoverAnchor}
            handlePopoverClose={handlePopoverClose}
          />
        </>
      ) : (
        <Button size="large" variant="contained" onClick={onConnectWalletClick}>
          Connect Wallet
        </Button>
      )}
    </Stack>
  );
}
