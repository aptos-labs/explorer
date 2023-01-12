import React, {useState} from "react";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  Button,
  Collapse,
  Dialog,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {truncateAddress} from "../utils";

const COPIED_TOOLTIP = 2000; // 2s

export default function Wallet() {
  const {wallets, connect, connected, account, disconnect} = useWallet();
  const [walletConnectOpen, setWalletConnectOpen] = useState<boolean>(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState<boolean>(false);
  const [copiedTooltipOpen, setCopiedTooltipOpen] = useState<boolean>(false);
  const handleConnectWalletClick = () => {
    setWalletConnectOpen(true);
  };
  const handleWalletDropdownClick = () => {
    setWalletDropdownOpen(!walletDropdownOpen);
  };
  const copyAddress = async () => {
    await navigator.clipboard.writeText(account?.address!);

    setCopiedTooltipOpen(true);

    setTimeout(() => {
      setCopiedTooltipOpen(false);
    }, COPIED_TOOLTIP);
  };

  return (
    <>
      {connected ? (
        <List component="nav" dense>
          <ListItemButton onClick={handleWalletDropdownClick}>
            <ListItemText primary={truncateAddress(account?.address!)} />
            {walletDropdownOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse
            in={walletDropdownOpen}
            timeout="auto"
            unmountOnExit
            sx={{position: "absolute"}}
          >
            <List component="div" disablePadding>
              <ListItemButton sx={{pl: 4}} onClick={copyAddress}>
                <ListItemText secondary="Copy Address" />
              </ListItemButton>
              <Tooltip
                title="Copied"
                placement="top-end"
                open={copiedTooltipOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <ListItemButton
                  sx={{pl: 4}}
                  onClick={() => {
                    disconnect();
                    setWalletConnectOpen(false);
                    setWalletDropdownOpen(false);
                  }}
                >
                  <ListItemText secondary="Disconnect" />
                </ListItemButton>
              </Tooltip>
            </List>
          </Collapse>
        </List>
      ) : (
        <>
          <Button onClick={handleConnectWalletClick}>Connect Wallet</Button>
          <Dialog
            title="Connect Your Wallet"
            open={walletConnectOpen}
            onClose={() => setWalletConnectOpen(false)}
          >
            <Stack>
              {wallets.map((wallet, index) => (
                <div
                  style={{display: "flex", alignItems: "center"}}
                  key={index}
                >
                  <img
                    style={{
                      width: "2em",
                      height: "2em",
                      marginRight: 10,
                    }}
                    src={wallet.icon}
                    alt={wallet.name}
                  />
                  <Typography>{wallet.name}</Typography>
                  {wallet.readyState === "Installed" ? (
                    <Button
                      onClick={() => connect(wallet.name)}
                      disabled={wallet.readyState !== "Installed"}
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button type="link" href={wallet.url}>
                      Install
                    </Button>
                  )}
                </div>
              ))}
            </Stack>
          </Dialog>
        </>
      )}
    </>
  );
}
