import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import {useState} from "react";
import {Banner} from "../../../components/Banner";
import {useTranslation} from "../../../i18n";
import StyledDialog from "../../../components/StyledDialog";
import {
  getDefunctProtocol,
  getWithdrawalPlugin,
} from "../../../data/defunctProtocols";
import type {WithdrawalPlugin} from "../../../types/defunctProtocol";
import {MIN_OWNER_WITHDRAWAL_PERCENT} from "../../../types/defunctProtocol";

interface DefunctProtocolBannerProps {
  address: string;
}

export function DefunctProtocolBanner({address}: DefunctProtocolBannerProps) {
  const protocol = getDefunctProtocol(address);
  if (!protocol) return null;

  const plugin = getWithdrawalPlugin(address);

  return <DefunctBannerInner protocolName={protocol.name} plugin={plugin} />;
}

function DefunctBannerInner({
  protocolName,
  plugin,
}: {
  protocolName: string;
  plugin: ReturnType<typeof getWithdrawalPlugin>;
}) {
  const {t} = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const withdrawButton = plugin ? (
    <Button
      variant="outlined"
      size="small"
      startIcon={<AccountBalanceWalletIcon />}
      onClick={() => setDialogOpen(true)}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        whiteSpace: {xs: "normal", sm: "nowrap"},
      }}
    >
      {t("accountUi.withdrawFunds")}
    </Button>
  ) : null;

  const text = plugin
    ? t("accountUi.defunctWithPlugin", {name: protocolName})
    : t("accountUi.defunctNoPlugin", {name: protocolName});

  return (
    <>
      <Banner
        pillText={t("accountUi.pill.defunct")}
        pillColor="warning"
        action={withdrawButton}
        sx={{marginBottom: 2}}
      >
        {text}
      </Banner>

      {plugin && (
        <WithdrawalDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          plugin={plugin}
          protocolName={protocolName}
        />
      )}
    </>
  );
}

function WithdrawalDialog({
  open,
  onClose,
  plugin,
  protocolName,
}: {
  open: boolean;
  onClose: () => void;
  plugin: WithdrawalPlugin;
  protocolName: string;
}) {
  const {t} = useTranslation();
  return (
    <StyledDialog
      handleDialogClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{px: 0, pt: 0}}>
        {t("accountUi.withdrawFrom", {name: protocolName})}
      </DialogTitle>
      <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{mb: 2}}>
        {t("accountUi.withdrawMinOwner", {
          percent: MIN_OWNER_WITHDRAWAL_PERCENT,
        })}
      </Alert>
      <Box sx={{mb: 2}}>
        <Typography
          variant="body2"
          gutterBottom
          sx={{
            color: "text.secondary",
          }}
        >
          {plugin.description}
        </Typography>
      </Box>
      <Divider sx={{my: 2}} />
      <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
        <Box sx={{display: "flex", justifyContent: "space-between"}}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            {t("accountUi.ownerReceives")}
          </Typography>
          <Chip
            label={`${plugin.ownerPercentage}%`}
            color="success"
            size="small"
            variant="outlined"
          />
        </Box>
        {plugin.ownerPercentage < 100 && (
          <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {t("accountUi.operatorFee")}
            </Typography>
            <Chip
              label={`${100 - plugin.ownerPercentage}%`}
              size="small"
              variant="outlined"
            />
          </Box>
        )}
        <Box sx={{display: "flex", justifyContent: "space-between"}}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            {t("accountUi.entryFunction")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              maxWidth: 280,
              textAlign: "right",
              wordBreak: "break-all",
            }}
          >
            {plugin.entryFunction}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{my: 2}} />
      <Alert severity="warning" sx={{mb: 2}}>
        {t("accountUi.withdrawWarning")}
      </Alert>
      <Button variant="outlined" fullWidth onClick={onClose}>
        {t("common.close")}
      </Button>
    </StyledDialog>
  );
}
