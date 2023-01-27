import {DialogTitle, Typography, DialogActions, Button} from "@mui/material";
import React, {useState} from "react";
import StyledDialog from "../../components/StyledDialog";
import WalletsModal from "../../components/WalletConnector/WalletModel";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

type WalletConnectionDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
};

export default function WalletConnectionDialog({
  handleDialogClose,
  isDialogOpen,
}: WalletConnectionDialogProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <DialogTitle>
        <Typography variant="h5" textAlign="center">
          Please connect your wallet
        </Typography>
        <Typography variant="caption" textAlign="center">
          You need to connect your wallet to be able to stake
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleModalOpen} variant="primary" fullWidth>
          <AccountBalanceWalletOutlinedIcon sx={{marginRight: 1}} />
          Connect Wallet
        </Button>
        <WalletsModal handleClose={handleClose} modalOpen={modalOpen} />
      </DialogActions>
    </StyledDialog>
  );
}
