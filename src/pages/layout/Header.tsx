import React, {useCallback, useEffect, useRef, useState} from "react";
import Toolbar from "@mui/material/Toolbar";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import NetworkSelect from "./NetworkSelect";
// import {useColorMode} from "../../context";
import {useMediaQuery, useTheme} from "@mui/material";

import LogoIconW from "../../assets/svg/logo_txt_w.svg?react";
import LogoIconB from "../../assets/svg/logo_txt_b.svg?react";
import IconBell from "../../assets/svg/icon_bell.svg?react";
import IconBellLight from "../../assets/svg/icon_bell_light.svg?react";

import Box from "@mui/material/Box";
import Nav from "./Nav";
import NavMobile from "./NavMobile";
import GlobalNavMenu from "./GlobalNavMenu";
import {grey} from "../../themes/colors/aptosColorPalette";
import {useInView} from "react-intersection-observer";
import FeatureBar from "./FeatureBar";
import {WalletConnector} from "../../components/WalletConnector";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {useWallet, SignMessageResponse} from "@aptos-labs/wallet-adapter-react";
import {sendToGTM} from "../../api/hooks/useGoogleTagManager";
import {Link, useNavigate} from "../../routing";
import {useLogEventWithBasic} from "../Account/hooks/useLogEventWithBasic";
import {sortPetraFirst} from "../../utils";
import {Stack} from "@mui/system";
import Button from "@mui/material/Button";
import {
  NotifiCardModal,
  NotifiCardModalProps,
  NotifiContextProvider,
} from "@notifi-network/notifi-react";
import "@notifi-network/notifi-react/dist/index.css";
import "./notifiCustomStyles.css";
import {Signature} from "@aptos-labs/ts-sdk";
import Badge from "@mui/material/Badge";
import {useNotifiHistoryContext} from "@notifi-network/notifi-react";

const customCopy: NotifiCardModalProps["copy"] = {
  Ftu: {
    FtuTargetEdit: {
      TargetInputs: {
        inputSeparators: {
          email: "OR",
          telegram: "OR",
        },
      },
    },
  },
  Inbox: {
    InboxConfigTargetEdit: {
      TargetInputs: {
        inputSeparators: {
          email: "OR",
          telegram: "OR",
        },
      },
    },
  },
};

interface BadgedBellIconProps {
  connected: boolean; // Indicates if the wallet is connected
  handleClick: () => void;
  isActive: boolean;
}

const BadgedBellIcon: React.FC<BadgedBellIconProps> = ({
  handleClick,
  isActive,
  connected,
}) => {
  const theme = useTheme();
  const {unreadCount} = useNotifiHistoryContext();

  if (!connected)
    return (
      <Button
        sx={{
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyItems: "center",
          padding: "0",
          minWidth: "30px",
          marginLeft: "1rem",
          color: "inherit",
          "&:hover": {
            border:
              theme.palette.mode === "light"
                ? `2px solid var(--notifi-color-gray)`
                : `2px solid var(--notifi-color-border)`,
            background: "transparent",
          },
          border: `${
            theme.palette.mode === "light"
              ? `2px solid var(--notifi-color-light-stroke)`
              : `2px solid var(--notifi-color-dark-gray)`
          }`,
        }}
        onClick={handleClick}
      >
        {theme.palette.mode === "light" ? <IconBellLight /> : <IconBell />}
      </Button>
    );

  return (
    <Badge
      badgeContent={unreadCount}
      sx={{
        "& .MuiBadge-badge": {
          backgroundColor: "var(--notifi-color-primary)",
          color: "var( --notifi-color-text)",
        },
      }}
    >
      <Button
        sx={{
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyItems: "center",
          padding: "0",
          minWidth: "30px",
          marginLeft: "1rem",
          color: "inherit",
          "&:hover": {
            border:
              isActive && theme.palette.mode === "light"
                ? "4px solid #A6A6A7"
                : isActive && theme.palette.mode !== "light"
                  ? "4px solid #635A2C"
                  : !isActive && theme.palette.mode === "light"
                    ? "2px solid #A6A6A7"
                    : "2px solid #645B2D",
            background: "transparent",
          },
          border: `${
            isActive && theme.palette.mode === "light"
              ? "4px solid #A6A6A7"
              : isActive && theme.palette.mode !== "light"
                ? "4px solid #635A2C"
                : !isActive && theme.palette.mode === "light"
                  ? "2px solid #E5E4E8"
                  : "2px solid #282B2A"
          }`,
        }}
        onClick={handleClick}
      >
        {theme.palette.mode === "light" ? <IconBellLight /> : <IconBell />}
      </Button>
    </Badge>
  );
};

function unwrapSignMessageResponse(
  signMessageResponse: SignMessageResponse,
): SignMessageResponse {
  // Handle weird edge case where its wrapped (seems to happen in Martian Wallet & Pontem..
  return (
    "result" in signMessageResponse
      ? signMessageResponse.result
      : signMessageResponse
  ) as SignMessageResponse;
}

function getHexSignatureFromSignMessageResponse(
  signMessageResponse: SignMessageResponse,
): `0x${string}` {
  // Handle Uint8Array directly
  if (signMessageResponse.signature instanceof Uint8Array) {
    return `0x${Buffer.from(signMessageResponse.signature).toString("hex")}`;
  }
  // Handle signature embedded as signature.data.data

  if (
    signMessageResponse.signature &&
    // @ts-expect-error - Suppress type-checking for nested `data.data` property
    signMessageResponse.signature.data &&
    // @ts-expect-error - Suppress type-checking for nested `data.data` property
    signMessageResponse.signature.data.data instanceof Uint8Array
  ) {
    // @ts-expect-error - Suppress type-checking for nested `data.data` property
    return `0x${Buffer.from(signMessageResponse.signature.data.data).toString("hex")}`;
  }
  // Handle signature as a string
  if (typeof signMessageResponse.signature === "string") {
    return signMessageResponse.signature as `0x${string}`;
  }
  // Handle signature as an instance of Signature
  if (signMessageResponse.signature instanceof Signature) {
    return `0x${Buffer.from(signMessageResponse.signature.toUint8Array()).toString("hex")}`;
  }
  // Handle unexpected signature types
  throw new Error("Unknown signature type");
}

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

  const {ref} = useInView({
    rootMargin: "-40px 0px 0px 0px",
    threshold: 0,
  });

  const [isNotifiPopupVisible, setIsNotifiPopupVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const bellIconRef = useRef<HTMLDivElement | null>(null);
  const notificationRequestedRef = useRef(false);

  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const [state, {setWalletConnectModalOpen}] = useGlobalState();
  const {account, wallet, network, connected, signMessage} = useWallet();
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

  const customClassName: NotifiCardModalProps["classNames"] = {
    container: "notifi-card-modal",
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as Node;
    if (
      modalRef.current &&
      !modalRef.current.contains(target) &&
      bellIconRef.current &&
      !bellIconRef.current.contains(target)
    ) {
      setIsNotifiPopupVisible(false);
    }
  };

  useEffect(() => {
    if (isNotifiPopupVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isNotifiPopupVisible]);

  useEffect(() => {
    if (
      account?.publicKey &&
      account?.address &&
      notificationRequestedRef.current
    ) {
      setTimeout(() => {
        setIsNotifiPopupVisible(true);
        notificationRequestedRef.current = false;
      }, 3000);
    }
  }, [account?.publicKey, account?.address]);

  const handleBellIconClick = useCallback(() => {
    if (!connected) {
      setWalletConnectModalOpen(true);
      notificationRequestedRef.current = true;
    } else {
      setIsNotifiPopupVisible(true);
    }
  }, [connected, setWalletConnectModalOpen]);

  const MobileHeader = useCallback(() => {
    return (
      <Box
        sx={{
          display: {xs: "flex", md: "none"},
          alignItems: "center",
          gap: 2,
        }}
      >
        <NetworkSelect />
        <NavMobile handleNotificationsClick={handleBellIconClick} />
      </Box>
    );
  }, [handleBellIconClick]);

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
              display: "flex", // Add this
              alignItems: "center", // Add this
              justifyContent: "space-between",
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

            <Box sx={{position: "relative"}} ref={bellIconRef}>
              {!connected && !isOnMobile && (
                <BadgedBellIcon
                  isActive={isNotifiPopupVisible}
                  connected={false}
                  handleClick={handleBellIconClick}
                />
              )}

              {connected &&
                account &&
                account?.publicKey &&
                account?.address && (
                  <NotifiContextProvider
                    tenantId="fcxw5v9dwb6wf0sk2r9o"
                    env="Production"
                    cardId="0192b8c523e570469f51c88cb50410a4"
                    signMessage={async (
                      message: string,
                      nonce: {toString: () => any},
                    ) => {
                      const signMessageResult = await signMessage({
                        message: message as string,
                        nonce: nonce.toString(),
                        address: true,
                      });

                      const unwrappedSignMessageResult =
                        unwrapSignMessageResponse(signMessageResult);
                      const signatureHex =
                        getHexSignatureFromSignMessageResponse(
                          unwrappedSignMessageResult,
                        );

                      return {
                        signatureHex,
                        signedMessage: unwrappedSignMessageResult.fullMessage,
                      };
                    }}
                    walletBlockchain="MOVEMENT"
                    walletPublicKey={account?.publicKey as string}
                    accountAddress={account?.address}
                  >
                    <>
                      {!isOnMobile && (
                        <BadgedBellIcon
                          handleClick={handleBellIconClick}
                          isActive={isNotifiPopupVisible}
                          connected={connected}
                        />
                      )}
                      {isNotifiPopupVisible && (
                        <Stack
                          sx={{
                            width: "351px",
                            position: "absolute",
                            top: "50px",
                            left: "50%",
                            transform: "translateX(calc(-50% + 10px))",
                            zIndex: 1,
                            borderWidth: "1px",
                            border: "2px solid #282B2A",
                          }}
                          ref={modalRef}
                        >
                          <NotifiCardModal
                            copy={customCopy}
                            darkMode={
                              theme.palette.mode === "light" ? false : true
                            }
                            classNames={customClassName}
                          />
                        </Stack>
                      )}
                    </>
                  </NotifiContextProvider>
                )}
            </Box>
            {/* {isOnMobile && <NetworkSelect />}
            <NavMobile /> */}
            {isOnMobile && <MobileHeader />}

            {!isOnMobile && (
              <Box sx={{marginLeft: "1rem"}}>
                <WalletConnector
                  networkSupport={state.network_name}
                  handleNavigate={() =>
                    navigate(`/account/${account?.address}`)
                  }
                  // sortAvailableWallets={sortPetraFirst}
                  // sortInstallableWallets={sortPetraFirst}
                  modalMaxWidth="sm"
                />
              </Box>
            )}

            {!isOnMobile && <GlobalNavMenu />}
          </Toolbar>
        </Container>
      </MuiAppBar>
    </>
  );
}
