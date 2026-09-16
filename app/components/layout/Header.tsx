import {AccountAddress} from "@aptos-labs/ts-sdk";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import {
  alpha,
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import {useEffect, useRef} from "react";
import {useGetInMainnet} from "../../api/hooks/useGetInMainnet";
import {sendToGTM} from "../../api/hooks/useGoogleTagManager";
import LogoIconDark from "../../assets/svg/aptos_logo_icon_dark.svg?react";
import LogoIconLight from "../../assets/svg/aptos_logo_icon_light.svg?react";
import {useNetworkName} from "../../global-config";
import {useInView} from "../../hooks/useInView";
import {useIsInIframe} from "../../hooks/useIsInIframe";
import {useIsStandalonePWA} from "../../hooks/useIsStandalonePWA";
import {useLogEventWithBasic} from "../../pages/Account/hooks/useLogEventWithBasic";
import {useTranslation} from "../../i18n";
import {Link, useNavigate} from "../../routing";
import {addressFromWallet, sortPetraFirst} from "../../utils";
import {WalletConnector} from "../WalletConnector";
import ColorModeToggleButton from "./ColorModeToggleButton";
import FeatureBar from "./FeatureBar";
import HeaderOverflowMenu from "./HeaderOverflowMenu";
import LanguageSelect from "./LanguageSelect";
import Nav from "./Nav";
import NetworkSelect from "./NetworkSelect";
import ShareButton from "./ShareButton";
import {useCompactHeader} from "./useCompactHeader";

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

  const theme = useTheme();
  const logEvent = useLogEventWithBasic();
  const {t, locale} = useTranslation();
  const isDark = theme.palette.mode === "dark";

  const {ref, inView} = useInView({
    rootMargin: "-40px 0px 0px 0px",
    threshold: 0,
  });

  const belowLg = !useMediaQuery(theme.breakpoints.up("lg"));
  const inMainnet = useGetInMainnet();
  const isStandalonePWA = useIsStandalonePWA();
  const isInIframe = useIsInIframe();
  const showShareButton = isStandalonePWA || isInIframe;

  const toolbarRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const networkRef = useRef<HTMLElement>(null);
  const languageRef = useRef<HTMLElement>(null);
  const shareRef = useRef<HTMLElement>(null);
  const desktopActionsRef = useRef<HTMLElement>(null);
  const isCompact = useCompactHeader({
    forceCompact: belowLg,
    toolbarRef,
    brandRef,
    navRef,
    networkRef,
    languageRef,
    shareRef,
    desktopActionsRef,
    remeasureKey: `${locale}:${inMainnet}:${showShareButton}`,
  });

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
        wallet_name: wallet?.name ?? "unknown",
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
          pointerEvents: "none",
        }}
        ref={ref}
      />
      <MuiAppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          top: 0,
          borderRadius: 0,
          backgroundColor: "transparent",
          overflow: "visible",
          zIndex: (theme) => theme.zIndex.appBar,
          isolation: "isolate",
          pt: "env(safe-area-inset-top, 0px)",
          pl: "env(safe-area-inset-left, 0px)",
          pr: "env(safe-area-inset-right, 0px)",
          // Keep blur on a non-interactive layer. Applying backdrop-filter on
          // the sticky AppBar itself makes iOS Safari skip taps on children
          // (hamburger + network select).
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            pointerEvents: "none",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            ...(!inView &&
              isDark && {
                backgroundColor: alpha(theme.palette.background.default, 0.85),
                borderBottom: `1px solid ${theme.palette.common}`,
              }),
            ...(!inView &&
              !isDark && {
                backgroundColor: alpha(theme.palette.background.default, 0.8),
                borderBottom: `2px solid ${alpha(theme.palette.text.primary, 0.05)}`,
              }),
          },
        }}
      >
        <FeatureBar />
        <Container maxWidth={false} sx={{minWidth: 0, px: {xs: 1, sm: 2}}}>
          <Toolbar
            ref={toolbarRef}
            sx={{
              height: "5rem",
              color: theme.palette.text.primary,
              minWidth: 0,
              width: "100%",
              columnGap: {xs: 0.5, lg: 0.5, xl: 1},
              flexWrap: "nowrap",
            }}
            disableGutters
          >
            <Box
              ref={brandRef}
              component={Link}
              onClick={scrollTop}
              to="/"
              aria-label={t("chrome.appName")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: {xs: 1.5, lg: 1, xl: 1.5},
                marginRight: "auto",
                minWidth: 0,
                flexShrink: 0,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: {xs: 40, sm: 48},
                  height: {xs: 40, sm: 48},
                  flexShrink: 0,
                  "& svg": {display: "block", width: "100%", height: "100%"},
                }}
              >
                {isDark ? (
                  <LogoIconDark width="100%" height="100%" aria-hidden="true" />
                ) : (
                  <LogoIconLight
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                  />
                )}
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  display: {xs: "none", sm: "block", lg: "none", xl: "block"},
                  fontSize: {sm: "1.1rem", md: "1.25rem"},
                }}
              >
                {t("chrome.appName")}
              </Typography>
            </Box>

            {!belowLg && (
              <Box
                ref={navRef}
                aria-hidden={isCompact}
                inert={isCompact || undefined}
                sx={
                  isCompact
                    ? {
                        position: "absolute",
                        visibility: "hidden",
                        display: "flex",
                        alignItems: "center",
                        height: 0,
                        overflow: "hidden",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        width: "max-content",
                      }
                    : {
                        display: "flex",
                        flexShrink: 0,
                        minWidth: 0,
                      }
                }
              >
                <Nav />
              </Box>
            )}
            <Box ref={networkRef} sx={{flexShrink: 0, minWidth: 0}}>
              <NetworkSelect />
            </Box>
            <Box ref={languageRef} sx={{flexShrink: 0, minWidth: 0}}>
              <LanguageSelect />
            </Box>
            {showShareButton && (
              <Box ref={shareRef} sx={{flexShrink: 0}}>
                <ShareButton />
              </Box>
            )}
            {!isCompact && (
              <Box
                ref={desktopActionsRef}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: "inherit",
                  flexShrink: 0,
                }}
              >
                <IconButton
                  component={Link}
                  to="/guide"
                  aria-label={t("chrome.openGuide")}
                  sx={{
                    color: "inherit",
                    flexShrink: 0,
                  }}
                >
                  <HelpOutlineOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  component={Link}
                  to="/settings"
                  aria-label={t("chrome.openSettings")}
                  sx={{
                    color: "inherit",
                    flexShrink: 0,
                  }}
                >
                  <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
                <ColorModeToggleButton />
                <Box sx={{flexShrink: 0}}>
                  <WalletConnector
                    networkSupport={networkName}
                    handleNavigate={() =>
                      navigate({to: `/account/${account?.address}`})
                    }
                    sortInstallableWallets={sortPetraFirst}
                    modalMaxWidth="sm"
                  />
                </Box>
              </Box>
            )}

            <HeaderOverflowMenu visible={isCompact} />
          </Toolbar>
        </Container>
      </MuiAppBar>
    </>
  );
}
