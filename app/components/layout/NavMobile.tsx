import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Divider, useTheme} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type React from "react";
import {useState} from "react";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
import CloseIcon from "../../assets/svg/icon_close.svg?react";
import HamburgerIcon from "../../assets/svg/icon_hamburger.svg?react";
import {useNetworkName} from "../../global-config";
import {useNavigate} from "../../routing";
import {sortPetraFirst} from "../../utils";
import {WalletConnector} from "../WalletConnector";

export default function NavMobile() {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const networkName = useNetworkName();
  const inMainnet = useGetInMainnet();
  const {account} = useWallet();
  const menuOpen = Boolean(menuAnchorEl);

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

  return (
    <Box sx={{display: {xs: "block", md: "none"}}}>
      <Button
        id="nav-mobile-button"
        aria-label="Navigation menu"
        aria-controls={menuOpen ? "nav-mobile-menu" : undefined}
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
        MenuListProps={{
          "aria-labelledby": "nav-mobile-button",
          sx: {
            minWidth: 240,
            padding: "1rem",
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
          Transactions
        </MenuItem>
        {inMainnet && (
          <MenuItem onClick={() => handleCloseAndNavigate("/analytics")}>
            Analytics
          </MenuItem>
        )}
        <MenuItem onClick={() => handleCloseAndNavigate("/validators")}>
          Validators
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/blocks")}>
          Blocks
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/coins")}>
          Coins
        </MenuItem>
        <MenuItem onClick={() => handleCloseAndNavigate("/documentation")}>
          Docs
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
