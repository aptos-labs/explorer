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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "@tanstack/react-router";
import {useEffect, useMemo, useRef, useState} from "react";
import {clearCachedSearchClients} from "../../api/createClient";
import {clearCachedV2Clients} from "../../global-config";
import {
  defaultExplorerClientSettings,
  type ExplorerClientSettings,
  normalizeGeomiDevApiKeyOverride,
  useExplorerSettings,
} from "../../settings";

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
  const [showGeomiDevApiKey, setShowGeomiDevApiKey] = useState(false);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraftSettings(settings);
      setShowGeomiDevApiKey(false);
    }
    wasOpenRef.current = open;
  }, [open, settings]);

  const hasChanges = useMemo(
    () =>
      normalizeGeomiDevApiKeyOverride(draftSettings.geomiDevApiKeyOverride) !==
        settings.geomiDevApiKeyOverride ||
      draftSettings.rememberGeomiDevApiKeyOverride !==
        settings.rememberGeomiDevApiKeyOverride,
    [draftSettings, settings],
  );

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);

    try {
      setExplorerSettings(draftSettings);
      clearCachedV2Clients();
      clearCachedSearchClients();
      await queryClient.invalidateQueries();
      await router.invalidate();
      onClose();
    } finally {
      setIsSaving(false);
    }
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
              Used only in your browser. By default the override is stored for
              the current browser session and cleared when the session ends.
            </Typography>
          </Box>

          <TextField
            autoComplete="off"
            fullWidth
            label="geomi.dev API key override"
            onChange={(event) =>
              setDraftSettings((currentSettings) => ({
                ...currentSettings,
                geomiDevApiKeyOverride: event.target.value,
              }))
            }
            placeholder="Paste your geomi.dev API key"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showGeomiDevApiKey ? "Hide API key" : "Show API key"
                      }
                      edge="end"
                      onClick={() => setShowGeomiDevApiKey((value) => !value)}
                    >
                      {showGeomiDevApiKey ? (
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
            type={showGeomiDevApiKey ? "text" : "password"}
            value={draftSettings.geomiDevApiKeyOverride}
          />

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
            Remembering the key stores it in this browser&apos;s local storage.
            Avoid enabling this on shared or untrusted devices.
          </Alert>

          <Alert severity="info">
            This key is not stored by the explorer application server. Your
            browser uses it only for client-side API requests. For best
            security, use a client key with only the origin{" "}
            <code>https://explorer.aptoslabs.com</code> enabled and enforced.
          </Alert>

          <Alert severity="info">
            Existing data will refresh after save so new requests use the
            updated key immediately.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 3}}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={() => setDraftSettings(defaultExplorerClientSettings)}
          disabled={isSaving || !draftSettings.geomiDevApiKeyOverride}
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
