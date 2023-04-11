import {
  DialogTitle,
  Typography,
  DialogActions,
  Stack,
  Box,
} from "@mui/material";
import React from "react";
import StyledDialog from "../../components/StyledDialog";
import {ReactComponent as ConnectWalletModalIcon} from "../../assets/forum_icon.svg";
import {WalletConnector} from "@aptos-labs/wallet-adapter-mui-design";
import {useGlobalState} from "../../global-config/GlobalConfig";

type WalletConnectionDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
};

export default function WalletConnectionDialog({
  handleDialogClose,
  isDialogOpen,
}: WalletConnectionDialogProps) {
  const [state] = useGlobalState();

  return (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <Box sx={{display: "flex", justifyContent: "center", marginY: 2}}>
        <ConnectWalletModalIcon />
      </Box>
      <DialogTitle textAlign="center">
        <div>Please connect your wallet</div>
        <Typography variant="caption" textAlign="center">
          You need to connect your wallet to be able to stake
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Stack sx={{width: "100%"}}>
          <WalletConnector networkSupport={state.network_name} />
        </Stack>
      </DialogActions>
    </StyledDialog>
  );
}
