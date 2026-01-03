import React, {useState} from "react";
import Toolbar from "@mui/material/Toolbar";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import {useColorMode} from "../../context/color-mode";
import {
  useMediaQuery,
  useTheme,
  alpha,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import {Link, useNavigate} from "@tanstack/react-router";
import {useInView} from "react-intersection-observer";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import NetworkSelect from "./NetworkSelect";
import {WalletConnector} from "../WalletConnector";
import {useNetworkName} from "../../global-config";
import {sortPetraFirst} from "../../utils";
// Import the actual Aptos logos
import LogoIconLight from "../../assets/svg/aptos_logo_icon_light.svg?react";
import LogoIconDark from "../../assets/svg/aptos_logo_icon_dark.svg?react";
import IconLight from "../../assets/svg/icon_light.svg?react";
import IconDark from "../../assets/svg/icon_dark.svg?react";

const navItems = [
  {label: "Transactions", to: "/transactions"},
  {label: "Validators", to: "/validators"},
  {label: "Blocks", to: "/blocks"},
  {label: "Analytics", to: "/analytics"},
];

export default function Header() {
  const scrollTop = () => {
    const docElement = document.documentElement;
    const windowTop =
      (window.scrollY || docElement.scrollTop) - (docElement.clientTop || 0);

    if (windowTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const {toggleColorMode} = useColorMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {ref, inView} = useInView({
    rootMargin: "-40px 0px 0px 0px",
    threshold: 0,
  });

  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const networkName = useNetworkName();
  const {account} = useWallet();

  return (
    <>
      <Box
        sx={{
          background: "transparent",
          height: "5rem",
          width: "100%",
          position: "absolute",
        }}
        ref={ref}
      />
      <MuiAppBar
        sx={{
          position: "sticky",
          top: "0",
          borderRadius: "0",
          backdropFilter: "blur(10px)",
          background: "transparent",
          ...(!inView &&
            isDark && {
              background: alpha(theme.palette.background.default, 0.85),
              borderBottom: `1px solid ${theme.palette.common}`,
            }),
          ...(!inView &&
            !isDark && {
              background: alpha(theme.palette.background.default, 0.8),
              borderBottom: `2px solid ${alpha(theme.palette.text.primary, 0.05)}`,
            }),
        }}
      >
        <Container maxWidth={false}>
          <Toolbar
            sx={{
              height: "5rem",
              color: theme.palette.text.primary,
            }}
            disableGutters
          >
            <Link
              onClick={scrollTop}
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginRight: "auto",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {isDark ? (
                <LogoIconDark width="3rem" height="3rem" />
              ) : (
                <LogoIconLight width="3rem" height="3rem" />
              )}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  display: {xs: "none", sm: "block"},
                  fontSize: {sm: "1.1rem", md: "1.25rem"},
                }}
              >
                Aptos Explorer
              </Typography>
            </Link>

            {/* Desktop Navigation */}
            {!isOnMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      textDecoration: "none",
                      color: theme.palette.text.secondary,
                      fontSize: "1rem",
                      fontWeight: 400,
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Box>
            )}

            <NetworkSelect />

            <Button
              onClick={toggleColorMode}
              sx={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
                padding: "0",
                minWidth: "30px",
                marginLeft: "1rem",
                color: "inherit",
                "&:hover": {background: "transparent", opacity: "0.8"},
              }}
            >
              {isDark ? <IconDark /> : <IconLight />}
            </Button>

            {/* Wallet Connect Button */}
            {!isOnMobile && (
              <Box sx={{marginLeft: "1rem"}}>
                <WalletConnector
                  networkSupport={networkName}
                  handleNavigate={() =>
                    navigate({to: `/account/${account?.address}`})
                  }
                  sortInstallableWallets={sortPetraFirst}
                  modalMaxWidth="sm"
                />
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isOnMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ml: 1}}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </MuiAppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box
          sx={{
            width: 280,
            height: "100%",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              p: 2,
            }}
          >
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.to} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate({to: item.to});
                    setMobileMenuOpen(false);
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
