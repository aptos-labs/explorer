import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Tooltip,
} from "@mui/material";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import React, {useState} from "react";
import {useNavigateWithParams} from "../../api/hooks/useNavigateWithParams";

type WalletMenuProps = {
  popoverAnchor: HTMLButtonElement | null;
  handlePopoverClose: () => void;
};

export default function WalletMenu({
  popoverAnchor,
  handlePopoverClose,
}: WalletMenuProps): JSX.Element {
  const {account, disconnect} = useWallet();
  const navigateWithParams = useNavigateWithParams();
  const popoverOpen = Boolean(popoverAnchor);
  const id = popoverOpen ? "wallet-popover" : undefined;

  const onAccountOptionClicked = () => {
    navigateWithParams(`/account/${account?.address}`);
    handlePopoverClose();
  };

  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const copyAddress = async (event: React.MouseEvent<HTMLDivElement>) => {
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
        <ListItem disablePadding>
          <ListItemButton onClick={onAccountOptionClicked}>
            <ListItemText primary="Account" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => disconnect()}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Popover>
  );
}
