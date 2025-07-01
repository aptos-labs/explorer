import {
  DialogTitle,
  Typography,
  DialogActions,
  Stack,
  Box,
} from "@mui/material";
import React from "react";
import StyledDialog from "../../components/StyledDialog";
import ConnectWalletModalIcon from "../../assets/forum_icon.svg?react";
import {WalletConnector} from "../../components/WalletConnector";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useNavigate} from "react-router-dom";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {sortPetraFirst} from "../../utils";

type WalletConnectionDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
};

export default function WalletConnectionDialog({
  handleDialogClose,
  isDialogOpen,
}: WalletConnectionDialogProps) {
  const [state] = useGlobalState();
  const navigate = useNavigate();
  const {account} = useWallet();

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
          <WalletConnector
            networkSupport={state.network_name}
            handleNavigate={() => navigate(`/account/${account?.address}`)}
            sortInstallableWallets={sortPetraFirst}
            modalMaxWidth="sm"
          />
        </Stack>
      </DialogActions>
    </StyledDialog>
  );
}
