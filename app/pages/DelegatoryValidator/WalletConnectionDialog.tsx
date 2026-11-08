import {
  Box,
  DialogActions,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import ConnectWalletModalIcon from "../../assets/forum_icon.svg?react";
import StyledDialog from "../../components/StyledDialog";
import {WalletConnector} from "../../components/WalletConnector";
import {useWallet} from "../../context/wallet-adapter";
import {useNetworkName} from "../../global-config/GlobalConfig";
import {useTranslation} from "../../i18n";
import {useNavigate} from "../../routing";
import {sortPetraFirst} from "../../utils";

type WalletConnectionDialogProps = {
  handleDialogClose: () => void;
  isDialogOpen: boolean;
};

export default function WalletConnectionDialog({
  handleDialogClose,
  isDialogOpen,
}: WalletConnectionDialogProps) {
  const {t} = useTranslation();
  const networkName = useNetworkName();
  const navigate = useNavigate();
  const {account} = useWallet();

  return (
    <StyledDialog handleDialogClose={handleDialogClose} open={isDialogOpen}>
      <Box sx={{display: "flex", justifyContent: "center", marginY: 2}}>
        <ConnectWalletModalIcon />
      </Box>
      <DialogTitle sx={{textAlign: "center"}}>
        <div>{t("staking.connectTitle")}</div>
        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
          }}
        >
          {t("staking.connectBody")}
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Stack sx={{width: "100%"}}>
          <WalletConnector
            networkSupport={networkName}
            handleNavigate={() =>
              navigate({to: `/account/${account?.address}`})
            }
            sortInstallableWallets={sortPetraFirst}
            modalMaxWidth="sm"
          />
        </Stack>
      </DialogActions>
    </StyledDialog>
  );
}
