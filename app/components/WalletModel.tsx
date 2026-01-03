import {
  AboutAptosConnect,
  AboutAptosConnectEducationScreen,
  AptosPrivacyPolicy,
  WalletItem,
  WalletSortingOptions,
  groupAndSortWallets,
  isInstallRequired,
  useWallet,
  aptosStandardSupportedWalletList,
  AdapterWallet,
  AdapterNotDetectedWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
// reported bug with loading mui icons with esm, therefore need to import like this https://github.com/mui/material-ui/issues/35233
import {
  ArrowBack,
  ArrowForward,
  Close as CloseIcon,
  LanOutlined as LanOutlinedIcon,
} from "@mui/icons-material";
import {JSX, useMemo} from "react";
import {WalletConnectorProps} from "./WalletConnector";

// Sort comparator for OKX wallet priority
const sortOkxFirst = (
  a: AdapterWallet | AdapterNotDetectedWallet,
  b: AdapterWallet | AdapterNotDetectedWallet,
) => {
  if (a.name === "OKX Wallet" && b.name !== "OKX Wallet") return -1;
  if (b.name === "OKX Wallet" && a.name !== "OKX Wallet") return 1;
  return 0;
};

interface WalletsModalProps
  extends
    Pick<WalletConnectorProps, "networkSupport" | "modalMaxWidth">,
    WalletSortingOptions {
  handleClose: () => void;
  modalOpen: boolean;
}

export default function WalletsModal({
  handleClose,
  modalOpen,
  networkSupport,
  modalMaxWidth,
  ...walletSortingOptions
}: WalletsModalProps): JSX.Element {
  const theme = useTheme();
  const {wallets: installedWallets = []} = useWallet();

  // Memoize wallet list construction to avoid recalculating on every render
  const wallets = useMemo(() => {
    const result: AdapterWallet[] = [...installedWallets];
    const installedWalletNames = result.map((wallet) => wallet.name);
    for (const wallet of aptosStandardSupportedWalletList) {
      if (!installedWalletNames.includes(wallet.name)) {
        result.push(wallet as unknown as AdapterWallet);
      }
    }
    return result;
  }, [installedWallets]);

  // Memoize wallet grouping and sorting
  const {
    aptosConnectWallets,
    filteredAvailableWallets,
    sortedInstallableWallets,
  } = useMemo(() => {
    const {aptosConnectWallets, availableWallets, installableWallets} =
      groupAndSortWallets([...wallets], walletSortingOptions);

    // Filter out "T wallet" and sort with OKX first
    const filteredAvailable = availableWallets
      .filter((wallet) => wallet.name !== "T wallet")
      .sort(sortOkxFirst);

    // Sort installable wallets with OKX first
    const sortedInstallable = [...installableWallets].sort(sortOkxFirst);

    return {
      aptosConnectWallets,
      filteredAvailableWallets: filteredAvailable,
      sortedInstallableWallets: sortedInstallable,
    };
  }, [wallets, walletSortingOptions]);

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      aria-label="wallet selector modal"
      sx={{borderRadius: `${theme.shape.borderRadius}px`}}
      maxWidth={modalMaxWidth ?? "xs"}
      fullWidth
    >
      <Stack
        sx={{
          top: "50%",
          left: "50%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          gap: 2,
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
        <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
          <Typography
            align="center"
            variant="h5"
            component="h2"
            pt={2}
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {hasAptosConnectWallets ? (
              <>
                <span>Log in or sign up</span>
                <span>with Social + Aptos Connect</span>
              </>
            ) : (
              "Connect Wallet"
            )}
          </Typography>
          {networkSupport && (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LanOutlinedIcon
                sx={{
                  fontSize: "0.9rem",
                  color: theme.palette.text.secondary,
                }}
              />
              <Typography
                sx={{
                  display: "inline-flex",
                  fontSize: "0.9rem",
                  color: theme.palette.text.secondary,
                }}
                align="center"
              >
                {networkSupport} only
              </Typography>
            </Box>
          )}
          {hasAptosConnectWallets && (
            <Stack gap={1}>
              {aptosConnectWallets.map((wallet) => (
                <AptosConnectWalletRow
                  key={wallet.name}
                  wallet={wallet}
                  onConnect={handleClose}
                />
              ))}
              <Typography
                component="p"
                fontSize="14px"
                sx={{
                  display: "flex",
                  gap: 0.5,
                  justifyContent: "center",
                  alignItems: "center",
                  color: theme.palette.text.secondary,
                }}
              >
                Learn more about{" "}
                <Box
                  component={AboutAptosConnect.Trigger}
                  sx={{
                    background: "none",
                    border: "none",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    gap: 0.5,
                    px: 0,
                    py: 1.5,
                    alignItems: "center",
                    color: theme.palette.text.primary,
                    appearance: "none",
                  }}
                >
                  Aptos Connect <ArrowForward sx={{height: 16, width: 16}} />
                </Box>
              </Typography>

              <Stack
                component={AptosPrivacyPolicy}
                alignItems="center"
                py={0.5}
              >
                <Typography component="p" fontSize="12px" lineHeight="20px">
                  <AptosPrivacyPolicy.Disclaimer />{" "}
                  <Box
                    component={AptosPrivacyPolicy.Link}
                    sx={{
                      color: theme.palette.text.secondary,
                      textDecoration: "underline",
                      textUnderlineOffset: "4px",
                    }}
                  />
                  <span>.</span>
                </Typography>
                <Box
                  component={AptosPrivacyPolicy.PoweredBy}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: theme.palette.text.secondary,
                  }}
                />
              </Stack>
              <Divider sx={{color: theme.palette.text.secondary, pt: 2}}>
                Or
              </Divider>
            </Stack>
          )}
          <Stack sx={{gap: 1}}>
            {filteredAvailableWallets.map((wallet) => (
              <WalletRow
                key={wallet.name}
                wallet={wallet}
                onConnect={handleClose}
              />
            ))}
            {!!sortedInstallableWallets.length && (
              <>
                <Stack sx={{gap: 1}}>
                  {sortedInstallableWallets.map((wallet) => (
                    <WalletRow
                      key={wallet.name}
                      wallet={wallet}
                      onConnect={handleClose}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        </AboutAptosConnect>
      </Stack>
    </Dialog>
  );
}

interface WalletRowProps {
  wallet: AdapterWallet | AdapterNotDetectedWallet;
  onConnect?: () => void;
}

function WalletRow({wallet, onConnect}: WalletRowProps) {
  const theme = useTheme();
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <ListItem disablePadding>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: 2,
            py: 1.5,
            gap: 2,
            border: "solid 1px",
            borderColor:
              theme.palette.mode === "dark"
                ? theme.palette.neutralShade.lighter
                : theme.palette.neutralShade.darker,
            borderRadius: `${theme.shape.borderRadius}px`,
          }}
        >
          <Box component={WalletItem.Icon} sx={{width: 32, height: 32}} />
          <ListItemText
            primary={wallet.name}
            primaryTypographyProps={{fontSize: "1.125rem"}}
          />
          {isInstallRequired(wallet) ? (
            <WalletItem.InstallLink asChild>
              <Button
                LinkComponent={"a"}
                size="small"
                className="wallet-connect-install"
              >
                Install
              </Button>
            </WalletItem.InstallLink>
          ) : (
            <WalletItem.ConnectButton asChild>
              <Button
                variant="contained"
                size="small"
                className="wallet-connect-button"
              >
                Connect
              </Button>
            </WalletItem.ConnectButton>
          )}
        </Box>
      </ListItem>
    </WalletItem>
  );
}

function AptosConnectWalletRow({wallet, onConnect}: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <WalletItem.ConnectButton asChild>
        <Button
          size="large"
          variant="outlined"
          sx={{display: "flex", alignItems: "center", gap: 1.5}}
        >
          <Box component={WalletItem.Icon} sx={{width: 20, height: 20}} />
          <WalletItem.Name />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 4fr 1fr",
          alignItems: "center",
          justifyItems: "start",
        }}
      >
        <IconButton onClick={screen.cancel}>
          <ArrowBack />
        </IconButton>
        <Typography variant="body1" component="h2" width="100%" align="center">
          About Aptos Connect
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          pb: 1.5,
          alignItems: "end",
          justifyContent: "center",
          height: "162px",
        }}
      >
        <screen.Graphic />
      </Box>
      <Stack sx={{gap: 1, textAlign: "center", pb: 2}}>
        <Typography component={screen.Title} variant="h6" />
        <Typography
          component={screen.Description}
          variant="body2"
          sx={{
            "&>a": {
              color: (theme) => theme.palette.text.primary,
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            },
          }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          variant="text"
          onClick={screen.back}
          sx={{justifySelf: "start"}}
        >
          Back
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            placeSelf: "center",
          }}
        >
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <Box
              key={i}
              component={ScreenIndicator}
              sx={{
                px: 0,
                py: 2,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  height: "2px",
                  width: "24px",
                  bgcolor: (theme) => theme.palette.text.disabled,
                  "[data-active]>&": {
                    bgcolor: (theme) => theme.palette.text.primary,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
        <Button
          size="small"
          variant="text"
          onClick={screen.next}
          sx={{justifySelf: "end"}}
          endIcon={<ArrowForward sx={{height: 16, width: 16}} />}
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </>
  );
}
