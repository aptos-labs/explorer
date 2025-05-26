import {
  AnyAptosWallet,
  AptosPrivacyPolicy,
  WalletItem,
  getAptosConnectWallets,
  isInstallRequired,
  partitionWallets,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Breakpoint,
  Button,
  Collapse,
  Dialog,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "../themes/colors/aptosColorPalette";
import { JSX } from "react";

// reported bug with loading mui icons with esm, therefore need to import like this https://github.com/mui/material-ui/issues/35233
import {
  Close as CloseIcon,
  ExpandMore,
  LanOutlined as LanOutlinedIcon,
} from "@mui/icons-material";
import { useState } from "react";
import {WalletConnectorProps} from "@aptos-labs/wallet-adapter-mui-design";


interface WalletsModalProps {
  handleClose: () => void;
  modalOpen: boolean;
  maxWidth?: Breakpoint;
  networkSupport?: string;
  sortDefaultWallets?: (a: AnyAptosWallet, b: AnyAptosWallet) => number;
  sortMoreWallets?: (a: AnyAptosWallet, b: AnyAptosWallet) => number;
}

export default function WalletsModal({
  handleClose,
  modalOpen,
  networkSupport,
  sortDefaultWallets,
  sortMoreWallets,
  maxWidth,
}: WalletsModalProps): JSX.Element {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const { wallets = [] } = useWallet();
  
  const {
    /** Wallets that use social login to create an account on the blockchain */
    aptosConnectWallets,
    /** Wallets that use traditional wallet extensions */
    otherWallets,
  } = getAptosConnectWallets(wallets);

  const {
    /** Wallets that are currently installed or loadable. */
    defaultWallets,
    /** Wallets that are NOT currently installed or loadable. */
    moreWallets,
  } = partitionWallets(otherWallets);

  if (sortDefaultWallets) defaultWallets.sort(sortDefaultWallets);
  if (sortMoreWallets) moreWallets.sort(sortMoreWallets);

  function cleanWalletList(wallets: AnyAptosWallet[]) {
    const unsupportedWallets = ['Dev T wallet', 'Pontem', 'TrustWallet', 'TokenPocket', 'Martian', 'Rise']
    return wallets
      .filter(
        (wallet, index, self) =>
          self.findIndex((w) => w.name === wallet.name) === index,
      )
      .filter((wallet) => {
        if (!wallet) return false;
        if (unsupportedWallets.includes(wallet.name)) {
          return false;
        }
        return wallet;
      });
  }

  const hasAptosConnectWallets = !!aptosConnectWallets.length;
  
  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      aria-label="wallet selector modal"
      sx={{ borderRadius: `${theme.shape.borderRadius}px` }}
      maxWidth={maxWidth ?? "xs"}
      fullWidth
    >
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
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
            color: grey[450],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          align="center"
          variant="h5"
          pt={2}
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
          fontWeight={600}
        >
          {false ? (
            <>
              <span>Log in or sign up</span>
              <span>with Social + Movement Connect</span>
            </>
          ) : (
            "Connect Wallet"
          )}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* {networkSupport && (
            <>
              <LanOutlinedIcon
                sx={{
                  fontSize: "0.9rem",
                  color: grey[400],
                }}
              />
              <Typography
                sx={{
                  display: "inline-flex",
                  fontSize: "0.9rem",
                  color: grey[400],
                }}
                align="center"
              >
                {networkSupport} only
              </Typography>
            </>
          )} */}
        </Box>
        {/* {hasAptosConnectWallets && (
          <>
            <Stack sx={{ gap: 1 }}>
              {aptosConnectWallets.map((wallet) => (
                <AptosConnectWalletRow
                  key={wallet.name}
                  wallet={wallet}
                  onConnect={handleClose}
                />
              ))}
            </Stack>
            <Stack component={AptosPrivacyPolicy} alignItems="center">
              <Typography component="p" fontSize="12px" lineHeight="20px">
                <AptosPrivacyPolicy.Disclaimer />{" "}
                <Box
                  component={AptosPrivacyPolicy.Link}
                  sx={{
                    color: grey[400],
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
                  color: grey[400],
                }}
              />
            </Stack> 
            <Divider sx={{ color: grey[400], pt: 2 }}>Or</Divider>
          </>
        )}*/}
        <Stack sx={{ gap: 1 }}>
          {cleanWalletList(defaultWallets).map((wallet: AnyAptosWallet) => (
            <WalletRow
              key={wallet.name}
              wallet={wallet}
              onConnect={handleClose}
            />
          ))}
          {!!moreWallets.length && (
            <>
              <Button
                variant="text"
                size="small"
                onClick={() => setExpanded((prev) => !prev)}
                endIcon={<ExpandMore sx={{ height: "20px", width: "20px" }} />}
              >
                More Wallets
              </Button>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Stack sx={{ gap: 1 }}>
                  {cleanWalletList(moreWallets).map((wallet: AnyAptosWallet) => (
                    <WalletRow
                      key={wallet.name}
                      wallet={wallet}
                      onConnect={handleClose}
                    />
                  ))}
                </Stack>
              </Collapse>
            </>
          )}
        </Stack>
      </Stack>
    </Dialog>
  );
}

interface WalletRowProps {
  wallet: AnyAptosWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
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
            borderColor: theme.palette.mode === "dark" ? grey[700] : grey[200],
            borderRadius: `${theme.shape.borderRadius}px`,
          }}
        >
          <Box component={WalletItem.Icon} sx={{ width: 32, height: 32 }} />
          <ListItemText
            primary={wallet.name}
            primaryTypographyProps={{ fontSize: "1.125rem" }}
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

function AptosConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <WalletItem.ConnectButton asChild>
        <Button
          size="large"
          variant="outlined"
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Box component={WalletItem.Icon} sx={{ width: 20, height: 20 }} />
          <WalletItem.Name />
        </Button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}