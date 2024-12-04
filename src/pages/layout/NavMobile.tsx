import React, {useState} from "react";

import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// @ts-expect-error logo
import HamburgerIcon from "../../assets/svg/icon_hamburger.svg?react";
// @ts-expect-error logo
import CloseIcon from "../../assets/svg/icon_close.svg?react";
import {grey} from "../../themes/colors/aptosColorPalette";
import Box from "@mui/material/Box";
import {Divider, useTheme} from "@mui/material";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
import {useNavigate} from "../../routing";
import {WalletConnector} from "../../components/WalletConnector";

import {useGlobalState} from "../../global-config/GlobalConfig";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {sortPetraFirst} from "../../utils";
import {useGetInTestnet} from "../../api/hooks/useGetInTestnet";
// import NetworkSelect from "./NetworkSelect";

export default function NavMobile() {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const [state] = useGlobalState();
  const inMainnet = useGetInMainnet();
  const inTestnet = useGetInTestnet();
  const {account} = useWallet();
  const menuOpen = Boolean(menuAnchorEl);

  const handleIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked");
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCloseAndNavigate = (to: string) => {
    setMenuAnchorEl(null);
    navigate(to);
  };

  console.log("Icons:", {CloseIcon, HamburgerIcon});

  return (
    <Box
      sx={{
        display: {xs: "block", md: "none"},
        padding: 2,
        position: "relative",
        zIndex: 1000,
      }}
    >
      <Button
        id="nav-mobile-button"
        aria-controls={menuOpen ? "nav-mobile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        onClick={handleIconClick}
        sx={{
          minWidth: "0",
          width: "1.5rem",
          padding: "0",
          ml: 2,
          color: "white",
          maxWidth: {xs: "100%", sm: "400px"},
          "&:hover": {
            background: "transparent",
            color: `${theme.palette.mode === "dark" ? grey[100] : grey[400]}`,
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
        {(inMainnet || inTestnet) && (
          <MenuItem onClick={() => handleCloseAndNavigate("/analytics")}>
            Analytics
          </MenuItem>
        )}
        {/*<MenuItem onClick={() => handleCloseAndNavigate("/validators")}>
          Validators
        </MenuItem>*/}
        <MenuItem onClick={() => handleCloseAndNavigate("/blocks")}>
          Blocks
        </MenuItem>

        <Divider />
        <WalletConnector
          networkSupport={state.network_name}
          handleNavigate={() => navigate(`/account/${account?.address}`)}
          sortDefaultWallets={sortPetraFirst}
          sortMoreWallets={sortPetraFirst}
          modalMaxWidth="sm"
        />
      </Menu>
    </Box>
  );
}
