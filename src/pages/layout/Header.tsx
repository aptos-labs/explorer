import React, {useRef, useEffect} from "react";
import Toolbar from "@mui/material/Toolbar";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import NetworkSelect from "./NetworkSelect";
import {useColorMode} from "../../context";
import {useMediaQuery, useTheme, alpha, Typography} from "@mui/material";
import IconLight from "../../assets/svg/icon_light.svg?react";
import LogoIconLight from "../../assets/svg/aptos_logo_icon_light.svg?react";
import LogoIconDark from "../../assets/svg/aptos_logo_icon_dark.svg?react";
import IconDark from "../../assets/svg/icon_dark.svg?react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Nav from "./Nav";
import NavMobile from "./NavMobile";
import {useInView} from "react-intersection-observer";
import FeatureBar from "./FeatureBar";
import {WalletConnector} from "../../components/WalletConnector";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {sendToGTM} from "../../api/hooks/useGoogleTagManager";
import {Link, useNavigate} from "../../routing";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {addressFromWallet, sortPetraFirst} from "../../utils";
import {AccountAddress} from "@aptos-labs/ts-sdk";

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
  const logEvent = useLogEventWithBasic();
  const isDark = theme.palette.mode === "dark";

  const {ref, inView} = useInView({
    rootMargin: "-40px 0px 0px 0px",
    threshold: 0,
  });

  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const networkName = useNetworkName();
  const {account, wallet, network} = useWallet();
  const navigate = useNavigate();
  const walletAddressRef = useRef("");
  const accountAddress = addressFromWallet(account?.address);

  // Handle wallet connection logging in useEffect instead of during render
  useEffect(() => {
    if (
      account &&
      accountAddress &&
      walletAddressRef.current !== accountAddress
    ) {
      logEvent("wallet_connected", accountAddress, {
        wallet_name: wallet!.name,
        network_type: networkName,
      });
      sendToGTM({
        dataLayer: {
          event: "walletConnection",
          walletAddress: account.address,
          walletName: wallet?.name,
          network: network?.name,
        },
      });
      walletAddressRef.current = AccountAddress.from(
        account.address,
      ).toString();
    }
  }, [account, accountAddress, networkName, wallet, logEvent, network?.name]);

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
      ></Box>
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
        <FeatureBar />
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
              color="inherit"
              underline="none"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                marginRight: "auto",
                textDecoration: "none",
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

            <Nav />
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
              {theme.palette.mode === "light" ? <IconLight /> : <IconDark />}
            </Button>
            <NavMobile />
            {!isOnMobile && (
              <Box sx={{marginLeft: "1rem"}}>
                <WalletConnector
                  networkSupport={networkName}
                  handleNavigate={() =>
                    navigate(`/account/${account?.address}`)
                  }
                  sortInstallableWallets={sortPetraFirst}
                  modalMaxWidth="sm"
                />
              </Box>
            )}
          </Toolbar>
        </Container>
      </MuiAppBar>
    </>
  );
}
