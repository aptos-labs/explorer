import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Tooltip,
} from "@mui/material";
import { useState } from "react";

type WalletMenuProps = {
  popoverAnchor: HTMLButtonElement | null;
  handlePopoverClose: () => void;
  handleNavigate?: () => void;
};

export default function WalletMenu({
  popoverAnchor,
  handlePopoverClose,
  handleNavigate,
}: WalletMenuProps): JSX.Element {
  const { account, disconnect } = useWallet();
  const popoverOpen = Boolean(popoverAnchor);
  const id = popoverOpen ? "wallet-popover" : undefined;

  const onAccountOptionClicked = () => {
    handleNavigate && handleNavigate();
    handlePopoverClose();
  };

  const handleLogout = () => {
    disconnect();
    handlePopoverClose();
  };

  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(account?.address!);

    setTooltipOpen(true);

    setTimeout(() => {
      setTooltipOpen(false);
    }, 2000);
  };

  return (
    <Popover
      id={id}
      open={popoverOpen}
      anchorEl={popoverAnchor}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <List>
        <Tooltip
          title="Copied"
          placement="bottom-end"
          open={tooltipOpen}
          disableFocusListener
          disableHoverListener
          disableTouchListener
        >
          <ListItem disablePadding>
            <ListItemButton onClick={copyAddress}>
              <ListItemText primary="Copy Address" />
            </ListItemButton>
          </ListItem>
        </Tooltip>
        {!!handleNavigate && (
          <ListItem disablePadding>
            <ListItemButton onClick={onAccountOptionClicked}>
              <ListItemText primary="Account" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Popover>
  );
}