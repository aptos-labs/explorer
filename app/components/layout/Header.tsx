import React, {useRef, useEffect, useState} from "react";
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
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import {Link, useNavigate} from "@tanstack/react-router";
import {useInView} from "react-intersection-observer";
import {useNetworkName} from "../../global-config";
import NetworkSelect from "./NetworkSelect";

// Aptos Logo component
const AptosLogoIcon = ({isDark}: {isDark: boolean}) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M26.8461 12.3333H21.4948C21.1102 12.3333 20.7386 12.4666 20.4408 12.7111L17.3333 15.2222L14.2259 12.7111C13.9281 12.4666 13.5565 12.3333 13.1719 12.3333H7.82051C7.08888 12.3333 6.49487 12.9273 6.49487 13.659V14.2222C6.49487 14.9539 7.08888 15.5479 7.82051 15.5479H12.3999L17.3333 19.5556L22.2668 15.5479H26.8461C27.5778 15.5479 28.1718 14.9539 28.1718 14.2222V13.659C28.1718 12.9273 27.5778 12.3333 26.8461 12.3333Z"
      fill={isDark ? "#F9F9F0" : "#0F0E0B"}
    />
    <path
      d="M26.8461 20.4521H21.4948C21.1102 20.4521 20.7386 20.5854 20.4408 20.8299L17.3333 23.341L14.2259 20.8299C13.9281 20.5854 13.5565 20.4521 13.1719 20.4521H7.82051C7.08888 20.4521 6.49487 21.0461 6.49487 21.7778V22.341C6.49487 23.0727 7.08888 23.6667 7.82051 23.6667H12.3999L17.3333 27.6744L22.2668 23.6667H26.8461C27.5778 23.6667 28.1718 23.0727 28.1718 22.341V21.7778C28.1718 21.0461 27.5778 20.4521 26.8461 20.4521Z"
      fill={isDark ? "#F9F9F0" : "#0F0E0B"}
    />
  </svg>
);

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
  const networkName = useNetworkName();
  const navigate = useNavigate();

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
              <AptosLogoIcon isDark={isDark} />
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
              {isDark ? <DarkModeIcon /> : <LightModeIcon />}
            </Button>

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
