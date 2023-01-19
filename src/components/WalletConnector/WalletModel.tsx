import {
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useWallet, WalletName} from "@aptos-labs/wallet-adapter-react";
import {grey} from "../../themes/colors/aptosColorPalette";
import React from "react";

type WalletsModalProps = {
  handleClose: () => void;
  modalOpen: boolean;
};

export default function WalletsModal({
  handleClose,
  modalOpen,
}: WalletsModalProps): JSX.Element {
  const {wallets, connect} = useWallet();

  const theme = useTheme();

  const style = {
    display: "flex",
    flexDirection: "column",
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    borderRadius: `${theme.shape.borderRadius}px`,
    boxShadow: 24,
    p: 3,
  };

  const onWalletSelect = (walletName: WalletName) => {
    connect(walletName);
    handleClose();
  };

  const renderWalletsList = () => {
    return wallets.map((wallet) => {
      const option = wallet;
      const icon = option.icon;
      return (
        <Grid key={option.name} xs={12}>
          {wallet.readyState === "Installed" ? (
            <ListItem disablePadding sx={{}}>
              <ListItemButton
                alignItems="center"
                disableGutters
                onClick={() => onWalletSelect(option.name)}
                sx={{
                  background:
                    theme.palette.mode === "dark" ? grey[700] : grey[200],
                  padding: "1rem 3rem",
                  borderRadius: `${theme.shape.borderRadius}px`,
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <ListItemAvatar
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "2rem",
                    height: "2rem",
                    minWidth: "0",
                    color: `${theme.palette.text.primary}`,
                  }}
                >
                  <Box
                    component="img"
                    src={icon}
                    sx={{width: "100%", height: "100%"}}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={option.name}
                  primaryTypographyProps={{
                    fontSize: 18,
                  }}
                />
                <Button variant="contained" size="small">
                  Connect
                </Button>
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem
              alignItems="center"
              sx={{
                borderRadius: `${theme.shape.borderRadius}px`,
                background:
                  theme.palette.mode === "dark" ? grey[700] : grey[200],
                padding: "1rem 3rem",
                gap: "1rem",
              }}
            >
              <ListItemAvatar
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "2rem",
                  height: "2rem",
                  minWidth: "0",
                  opacity: "0.25",
                }}
              >
                <Box
                  component="img"
                  src={icon}
                  sx={{width: "100%", height: "100%"}}
                />
              </ListItemAvatar>
              <ListItemText
                sx={{
                  opacity: "0.25",
                }}
                primary={option.name}
                primaryTypographyProps={{
                  fontSize: 18,
                }}
              />
              <Button
                LinkComponent={"a"}
                href={option.url}
                target="_blank"
                size="small"
              >
                Install
              </Button>
            </ListItem>
          )}
        </Grid>
      );
    });
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="wallet selector modal"
      aria-describedby="select a wallet to connect"
    >
      <Box sx={style}>
        <Typography align="center" variant="h5" pt={2}>
          Connect Wallet
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        />
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          {renderWalletsList()}
        </Grid>
      </Box>
    </Modal>
  );
}
