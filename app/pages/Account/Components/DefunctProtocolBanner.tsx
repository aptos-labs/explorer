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
      Withdraw Funds
    </Button>
  ) : null;

  const text = plugin
    ? `This protocol (${protocolName}) may be defunct. A withdrawal plugin is available to recover your funds.`
    : `This protocol (${protocolName}) may be defunct and is no longer actively maintained.`;

  return (
    <>
      <Banner
        pillText="MAY BE DEFUNCT"
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
  return (
    <StyledDialog
      handleDialogClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{px: 0, pt: 0}}>
        Withdraw from {protocolName}
      </DialogTitle>

      <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{mb: 2}}>
        At least {MIN_OWNER_WITHDRAWAL_PERCENT}% of withdrawn funds will be
        returned to the original owner / requester.
      </Alert>

      <Box sx={{mb: 2}}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {plugin.description}
        </Typography>
      </Box>

      <Divider sx={{my: 2}} />

      <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
        <Box sx={{display: "flex", justifyContent: "space-between"}}>
          <Typography variant="body2" color="text.secondary">
            Owner receives
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
            <Typography variant="body2" color="text.secondary">
              Operator fee
            </Typography>
            <Chip
              label={`${100 - plugin.ownerPercentage}%`}
              size="small"
              variant="outlined"
            />
          </Box>
        )}
        <Box sx={{display: "flex", justifyContent: "space-between"}}>
          <Typography variant="body2" color="text.secondary">
            Entry function
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
        Connect your wallet and interact with the protocol&apos;s contract
        directly to execute the withdrawal. Verify the transaction details
        carefully before signing.
      </Alert>

      <Button variant="outlined" fullWidth onClick={onClose}>
        Close
      </Button>
    </StyledDialog>
  );
}
