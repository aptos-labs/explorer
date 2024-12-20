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

interface NavMobileProps {
  handleNotificationsClick: () => void;
}

export default function NavMobile({handleNotificationsClick}: NavMobileProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const [state] = useGlobalState();
  const inMainnet = useGetInMainnet();
  const inTestnet = useGetInTestnet();
  const {account, connected} = useWallet();
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

  return (
    <Box
      sx={{
        display: {xs: "block", md: "none"},
        padding: 1,
        zIndex: 9999,
      }}
    >
      <Button
        id="nav-mobile-button"
        aria-controls={menuOpen ? "nav-mobile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : undefined}
        onClick={handleIconClick}
        sx={{
          minWidth: "24px",
          width: "24px",
          height: "24px",
          padding: 0,
          color: "red",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            background: "transparent",
            color: `${theme.palette.mode === "dark" ? grey[100] : grey[400]}`,
          },
          "&[aria-expanded=true]": {opacity: "0.7"},
          "& svg": {
            color: "white",
            width: "24px",
            height: "24px",
          },
        }}
      >
        {menuOpen ? (
          <CloseIcon />
        ) : (
          <HamburgerIcon
            sx={{
              fontSize: 24,
              width: 24,
              height: 24,
              color: "red",
              "& path": {
                stroke: "white",
                strokeWidth: 2,
              },
            }}
          />
        )}
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
        <MenuItem
          onClick={() => {
            handleNotificationsClick();
            if (connected) setMenuAnchorEl(null);
          }}
        >
          Notifications
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
