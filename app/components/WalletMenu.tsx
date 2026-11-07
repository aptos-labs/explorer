import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Tooltip,
} from "@mui/material";
import {type JSX, useState} from "react";
import {useTranslation} from "../i18n";
import {useNavigate} from "../routing";

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
  const {account, disconnect} = useWallet();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const popoverOpen = Boolean(popoverAnchor);
  const id = popoverOpen ? "wallet-popover" : undefined;

  const onAccountOptionClicked = () => {
    if (handleNavigate) {
      handleNavigate();
    }
    handlePopoverClose();
  };

  const onRunScriptClicked = () => {
    handlePopoverClose();
    navigate({to: "/run-script"});
  };

  const handleLogout = () => {
    disconnect();
    handlePopoverClose();
  };

  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(account?.address.toString() || "");

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
          title={t("common.copied")}
          placement="bottom-end"
          open={tooltipOpen}
          disableFocusListener
          disableHoverListener
          disableTouchListener
        >
          <ListItem disablePadding>
            <ListItemButton onClick={copyAddress}>
              <ListItemText primary={t("common.copyAddress")} />
            </ListItemButton>
          </ListItem>
        </Tooltip>
        {!!handleNavigate && (
          <ListItem disablePadding>
            <ListItemButton onClick={onAccountOptionClicked}>
              <ListItemText primary={t("common.account")} />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={onRunScriptClicked}>
            <ListItemText
              primary={t("chrome.nav.runScript")}
              secondary={t("chrome.nav.runScriptTitle")}
              slotProps={{
                secondary: {
                  sx: {
                    fontSize: "0.7rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
              }}
            />
          </ListItemButton>
        </ListItem>
        <Divider component="li" />
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary={t("common.logout")} />
          </ListItemButton>
        </ListItem>
      </List>
    </Popover>
  );
}
