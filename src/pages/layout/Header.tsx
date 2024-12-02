import React, {useRef} from "react";
import Toolbar from "@mui/material/Toolbar";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import NetworkSelect from "./NetworkSelect";
// import {useColorMode} from "../../context";
import {useMediaQuery, useTheme} from "@mui/material";

// @ts-expect-error logo
import LogoIconW from "../../assets/svg/logo_txt_w.svg?react";
// @ts-expect-error logo
import LogoIconB from "../../assets/svg/logo_txt_b.svg?react";

import Box from "@mui/material/Box";
import Nav from "./Nav";
import NavMobile from "./NavMobile";
import {grey} from "../../themes/colors/aptosColorPalette";
import {useInView} from "react-intersection-observer";
import FeatureBar from "./FeatureBar";
import {WalletConnector} from "../../components/WalletConnector";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {sendToGTM} from "../../api/hooks/useGoogleTagManager";
import {Link, useNavigate} from "../../routing";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {sortPetraFirst} from "../../utils";

export default function Header() {
  const scrollTop = () => {
    const docElement = document.documentElement;
    const windowTop =
      (window.pageYOffset || docElement.scrollTop) -
      (docElement.clientTop || 0);

    if (windowTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const theme = useTheme();
  const logEvent = useLogEventWithBasic();

  const {ref} = useInView({
    rootMargin: "-40px 0px 0px 0px",
    threshold: 0,
  });

  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const [state] = useGlobalState();
  const {account, wallet, network} = useWallet();
  const navigate = useNavigate();
  const walletAddressRef = useRef("");

  if (account && walletAddressRef.current !== account.address) {
    logEvent("wallet_connected", account.address, {
      wallet_name: wallet!.name,
      network_type: state.network_name,
    });
    sendToGTM({
      dataLayer: {
        event: "walletConnection",
        walletAddress: account.address,
        walletName: wallet?.name,
        network: network?.name,
      },
    });
    walletAddressRef.current = account.address;
  }

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
          background: "#000000",
        }}
      >
        <FeatureBar />
        <Container maxWidth={false}>
          <Toolbar
            sx={{
              height: "5rem",
              color:
                theme.palette.mode === "dark" ? grey[50] : "rgba(18,22,21,1)",
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
                maxWidth: "33vw",
                marginRight: "auto",
              }}
            >
              {theme.palette.mode === "dark" ? (
                <LogoIconW
                  style={{width: "100%", height: "auto", maxWidth: "221px"}}
                />
              ) : (
                <LogoIconB
                  style={{width: "100%", height: "auto", maxWidth: "221px"}}
                />
              )}
            </Link>

            <Nav />

            {isOnMobile && <NetworkSelect />}

            <NavMobile />
            {!isOnMobile && (
              <Box sx={{marginLeft: "1rem"}}>
                <WalletConnector
                  networkSupport={state.network_name}
                  handleNavigate={() =>
                    navigate(`/account/${account?.address}`)
                  }
                  sortDefaultWallets={sortPetraFirst}
                  sortMoreWallets={sortPetraFirst}
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
