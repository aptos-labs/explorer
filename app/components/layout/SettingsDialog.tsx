import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "@tanstack/react-router";
import {useEffect, useMemo, useRef, useState} from "react";
import {clearCachedSearchClients} from "../../api/createClient";
import {emitApiKeySaved} from "../../context/rate-limit";
import {clearCachedV2Clients} from "../../global-config";
import {networks, type NetworkName} from "../../lib/constants";
import {
  defaultExplorerClientSettings,
  type ExplorerClientSettings,
  normalizeGeomiDevApiKeyOverride,
  sanitizeExplorerClientSettings,
  useExplorerSettings,
} from "../../settings";

const SETTINGS_NETWORKS = Object.keys(networks) as NetworkName[];

function networkLabel(name: NetworkName): string {
  if (name === "local") {
    return "Local";
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function settingsEqual(
  a: ExplorerClientSettings,
  b: ExplorerClientSettings,
): boolean {
  return (
    JSON.stringify(sanitizeExplorerClientSettings(a)) ===
    JSON.stringify(sanitizeExplorerClientSettings(b))
  );
}

function hasAnyOverride(settings: ExplorerClientSettings): boolean {
  return (
    Object.keys(
      sanitizeExplorerClientSettings(settings).geomiDevApiKeyOverridesByNetwork,
    ).length > 0
  );
}

type SettingsDialogProps = {
  onClose: () => void;
  open: boolean;
};

export default function SettingsDialog({onClose, open}: SettingsDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {settings, setExplorerSettings} = useExplorerSettings();
  const [draftSettings, setDraftSettings] =
    useState<ExplorerClientSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraftSettings(settings);
      setShowApiKeys(false);
    }
    wasOpenRef.current = open;
  }, [open, settings]);

  const hasChanges = useMemo(
    () => !settingsEqual(draftSettings, settings),
    [draftSettings, settings],
  );

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);

    try {
      const hasApiKey = hasAnyOverride(draftSettings);
      setExplorerSettings(draftSettings);
      if (hasApiKey) {
        emitApiKeySaved();
      }
      clearCachedV2Clients();
      clearCachedSearchClients();
      await queryClient.invalidateQueries();
      await router.invalidate();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const updateOverride = (network: NetworkName, value: string) => {
    setDraftSettings((current) => {
      const next = {...current.geomiDevApiKeyOverridesByNetwork};
      const trimmed = normalizeGeomiDevApiKeyOverride(value);
      if (trimmed) {
        next[network] = value;
      } else {
        delete next[network];
      }
      return {
        ...current,
        geomiDevApiKeyOverridesByNetwork: next,
      };
    });
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{pt: 1}}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              API overrides
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Optional geomi.dev API keys per network. Used only in your
              browser. Leave a network empty to use the default key from the
              build (if any). By default, overrides are stored for the current
              browser session and cleared when the session ends.
            </Typography>
          </Box>

          {SETTINGS_NETWORKS.map((network) => (
            <TextField
              key={network}
              autoComplete="off"
              fullWidth
              label={`${networkLabel(network)} API key`}
              onChange={(event) => updateOverride(network, event.target.value)}
              placeholder={`Paste key for ${networkLabel(network)} (optional)`}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showApiKeys ? "Hide API keys" : "Show API keys"
                        }
                        edge="end"
                        onClick={() => setShowApiKeys((value) => !value)}
                      >
                        {showApiKeys ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  spellCheck: false,
                },
              }}
              type={showApiKeys ? "text" : "password"}
              value={
                draftSettings.geomiDevApiKeyOverridesByNetwork[network] ?? ""
              }
            />
          ))}

          <Typography variant="body2" color="text.secondary">
            Don&apos;t have a key?{" "}
            <MuiLink
              href="https://geomi.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get one at geomi.dev
            </MuiLink>
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={draftSettings.rememberGeomiDevApiKeyOverride}
                onChange={(event) =>
                  setDraftSettings((currentSettings) => ({
                    ...currentSettings,
                    rememberGeomiDevApiKeyOverride: event.target.checked,
                  }))
                }
              />
            }
            label="Remember on this device"
          />

          <Alert severity="warning">
            Remembering keys stores them in this browser&apos;s local storage.
            Avoid enabling this on shared or untrusted devices.
          </Alert>

          <Alert severity="info">
            Keys are not stored by the explorer application server. Your browser
            uses them only for client-side API requests. For best security, use
            client keys with only the origin{" "}
            <code>https://explorer.aptoslabs.com</code> enabled and enforced.
          </Alert>

          <Alert severity="info">
            Existing data will refresh after save so new requests use the
            updated keys immediately.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 3}}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={() => setDraftSettings(defaultExplorerClientSettings)}
          disabled={isSaving || !hasAnyOverride(draftSettings)}
        >
          Clear
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaving || !hasChanges}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
