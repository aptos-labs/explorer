import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
import {useNavigate} from "../../routing";
import {sortPetraFirst} from "../../utils";
import {WalletConnector} from "../WalletConnector";

/**
 * Header overflow menu. Always renders the dark-mode toggle so that the
 * theme switch lives in a single, predictable place across viewports and
 * standalone-PWA / iframe embeddings.
 *
 * On compact viewports (`xs`–`md`) it also doubles as the primary nav menu
 * (mirroring the inline `Nav` links and the wallet connector). On wide
 * viewports (`lg+`) those duplicate entries are suppressed and the menu acts
 * as a small "preferences" drop-down anchored next to the Settings icon.
 *
 * Previously named `NavMobile`. Renamed to a viewport-neutral name once the
 * component started rendering on all viewports (not just mobile).
 */
export default function HeaderOverflowMenu() {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const networkName = useNetworkName();
  const inMainnet = useGetInMainnet();
  const {account} = useWallet();
  const {toggleColorMode} = useColorMode();
  const menuOpen = Boolean(menuAnchorEl);
  const isDark = theme.palette.mode === "dark";
  const isWideViewport = useMediaQuery(theme.breakpoints.up("lg"));
  const showCompactItems = !isWideViewport;

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
    <Box sx={{display: "block"}}>
      <Button
        id="header-overflow-menu-button"
        aria-label={showCompactItems ? "Navigation menu" : "Preferences menu"}
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
        {showCompactItems && [
          <MenuItem
            key="transactions"
            onClick={() => handleCloseAndNavigate("/transactions")}
          >
            Transactions
          </MenuItem>,
          inMainnet ? (
            <MenuItem
              key="analytics"
              onClick={() => handleCloseAndNavigate("/analytics")}
            >
              Analytics
            </MenuItem>
          ) : null,
          <MenuItem
            key="validators"
            onClick={() => handleCloseAndNavigate("/validators")}
          >
            Validators
          </MenuItem>,
          <MenuItem
            key="blocks"
            onClick={() => handleCloseAndNavigate("/blocks")}
          >
            Blocks
          </MenuItem>,
          <MenuItem
            key="coins"
            onClick={() => handleCloseAndNavigate("/coins")}
          >
            Coins
          </MenuItem>,
          <MenuItem
            key="releases"
            onClick={() => handleCloseAndNavigate("/releases")}
          >
            Releases
          </MenuItem>,
          <MenuItem
            key="settings"
            onClick={() => handleCloseAndNavigate("/settings")}
          >
            Settings
          </MenuItem>,
        ]}
        <MenuItem
          onClick={handleToggleColorMode}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
            {isDark ? "Switch to light mode" : "Switch to dark mode"}
          </ListItemText>
        </MenuItem>
        {showCompactItems && [
          <Divider key="wallet-divider" />,
          <WalletConnector
            key="wallet"
            networkSupport={networkName}
            handleNavigate={() =>
              navigate({to: `/account/${account?.address}`})
            }
            sortAvailableWallets={sortPetraFirst}
            sortInstallableWallets={sortPetraFirst}
            modalMaxWidth="sm"
          />,
        ]}
      </Menu>
    </Box>
  );
}
