/**
 * Reusable confirmation dialog shown before kicking off a long-running
 * sequence of API calls (e.g. CSV exports, bulk view-function lookups)
 * that is likely to trip the user's per-IP rate limit unless they have
 * a personal API key configured.
 *
 * If the user already has a per-network API key override set in
 * `/settings`, the dialog is skipped: their request budget is much
 * larger and no warning is needed.
 *
 * Renders nothing when `open` is `false`. The caller drives `open` and
 * receives a callback for "Continue anyway" vs "Take me to Settings".
 */

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import {Link, useNavigate} from "../routing";

export type ApiKeyConfirmDialogProps = {
  /** Whether the dialog is currently shown. */
  open: boolean;
  /** Action that triggered the dialog, e.g. "export 10,000 transactions". */
  actionLabel: string;
  /** Approximate number of upstream requests the action will issue. */
  estimatedRequests: number;
  /**
   * Called when the user decides to proceed despite not having an API key
   * set. Caller is responsible for closing the dialog.
   */
  onContinue: () => void;
  /** Called when the user dismisses the dialog without proceeding. */
  onCancel: () => void;
};

const GEOMI_DEV_URL = "https://geomi.dev";

export default function ApiKeyConfirmDialog({
  open,
  actionLabel,
  estimatedRequests,
  onContinue,
  onCancel,
}: ApiKeyConfirmDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="api-key-confirm-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="api-key-confirm-title">
        Likely to be rate-limited
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <DialogContentText>
            You&apos;re about to {actionLabel}, which issues roughly{" "}
            <strong>{estimatedRequests.toLocaleString()}</strong> upstream
            requests. Without your own API key configured, the Aptos
            Gateway&apos;s public IP rate limits will throttle some of these
            calls and the result may be partial.
          </DialogContentText>
          <DialogContentText>
            Add a free API key in{" "}
            <MuiLink component={Link} to="/settings" onClick={onCancel}>
              Settings
            </MuiLink>{" "}
            to lift the per-IP limit. You can get one at{" "}
            <MuiLink
              href={GEOMI_DEV_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              geomi.dev
            </MuiLink>
            .
          </DialogContentText>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="outlined"
          startIcon={<SettingsOutlinedIcon />}
          onClick={() => {
            onCancel();
            navigate({to: "/settings"});
          }}
        >
          Open Settings
        </Button>
        <Button variant="contained" onClick={onContinue} color="warning">
          Continue anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
}
