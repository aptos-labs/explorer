import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Divider, ListItemIcon, ListItemText, useTheme} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type React from "react";
import {useState} from "react";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
import CloseIcon from "../../assets/svg/icon_close.svg?react";
import IconDark from "../../assets/svg/icon_dark.svg?react";
import HamburgerIcon from "../../assets/svg/icon_hamburger.svg?react";
import IconLight from "../../assets/svg/icon_light.svg?react";
import {useColorMode} from "../../context/color-mode";
import {useNetworkName} from "../../global-config";
import {useTranslation} from "../../i18n";
import {useNavigate} from "../../routing";
import {sortPetraFirst} from "../../utils";
import {WalletConnector} from "../WalletConnector";
import {LanguageOverflowMenuItem} from "./LanguageSelect";

/**
 * Compact-viewport header menu (`xs`–`md`, below the `lg` breakpoint).
 * Mirrors inline `Nav` links, User Guide, Settings, language, the theme toggle,
 * and the wallet connector. On wide viewports (`lg+`) the toolbar shows those
 * controls directly (`LanguageSelect` icon, `ColorModeToggleButton`, Help,
 * Settings icon, `Nav`, `WalletConnector`).
 *
 * Previously named `NavMobile`, then `HeaderOverflowMenu` when it briefly
 * rendered on all viewports as a preferences drop-down.
 */
export default function HeaderOverflowMenu() {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const networkName = useNetworkName();
  const inMainnet = useGetInMainnet();
  const {account} = useWallet();
  const {toggleColorMode} = useColorMode();
  const {t} = useTranslation();
  const menuOpen = Boolean(menuAnchorEl);
  const isDark = theme.palette.mode === "dark";

  const handleIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCloseAndNavigate = (to: string) => {
    setMenuAnchorEl(null);
    navigate({to});
  };

  const handleToggleColorMode = () => {
    toggleColorMode();
    setMenuAnchorEl(null);
  };

  return (
    <Box sx={{display: {xs: "block", lg: "none"}}}>
      <Button
        id="header-overflow-menu-button"
        aria-label={t("chrome.overflowMenuAriaLabel")}
        aria-controls={menuOpen ? "header-overflow-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        onClick={handleIconClick}
        sx={{
          minWidth: "0",
          width: "1.5rem",
          padding: "0",
          ml: 2,
          color: "inherit",
          "&:hover": {
            background: "transparent",
            color: theme.palette.text.secondary,
          },
          "&[aria-expanded=true]": {opacity: "0.7"},
        }}
      >
        {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
      </Button>
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        slotProps={{
          list: {
            "aria-labelledby": "header-overflow-menu-button",
            sx: {
              minWidth: 240,
              padding: "1rem",
            },
          },
        }}
        sx={{
          marginTop: "1rem",
          boxShadow: 0,
          minWidth: "400px",
          maxWidth: "none",
        }}
      >
        <MenuItem onClick={() => handleCloseAndNavigate("/transactions")}>
          {t("chrome.nav.transactions")}
        </MenuItem>
        {inMainnet ? (
          <MenuItem onClick={() => handleCloseAndNavigate("/analytics")}>
            {t("chrome.nav.analytics")}
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => handleCloseAndNavigate("/validators")}>
          {t("chrome.nav.validators")}
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/blocks")}>
          {t("chrome.nav.blocks")}
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/coins")}>
          {t("chrome.nav.coins")}
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/releases")}>
          {t("chrome.nav.releases")}
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/run-script")}>
          {t("chrome.nav.runScript")}
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/guide")}>
          {t("chrome.nav.guide")}
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/settings")}>
          {t("chrome.nav.settings")}
        </MenuItem>
        <LanguageOverflowMenuItem onPicked={handleMenuClose} />
        <MenuItem
          onClick={handleToggleColorMode}
          aria-label={
            isDark ? t("chrome.switchToLight") : t("chrome.switchToDark")
          }
        >
          <ListItemIcon
            sx={{minWidth: "1.75rem", color: theme.palette.text.primary}}
          >
            {isDark ? (
              <IconLight width={16} height={16} />
            ) : (
              <IconDark width={16} height={16} />
            )}
          </ListItemIcon>
          <ListItemText>
            {isDark ? t("chrome.switchToLight") : t("chrome.switchToDark")}
          </ListItemText>
        </MenuItem>
        <Divider />
        <WalletConnector
          networkSupport={networkName}
          handleNavigate={() => navigate({to: `/account/${account?.address}`})}
          sortAvailableWallets={sortPetraFirst}
          sortInstallableWallets={sortPetraFirst}
          modalMaxWidth="sm"
        />
      </Menu>
    </Box>
  );
}
