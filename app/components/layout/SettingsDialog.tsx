import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "@tanstack/react-router";
import {useEffect, useMemo, useState} from "react";
import {clearCachedSearchClients} from "../../api/createClient";
import {clearCachedV2Clients} from "../../global-config";
import {
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
  const {
    settings: {geomiDevApiKeyOverride},
    setGeomiDevApiKeyOverride,
  } = useExplorerSettings();
  const [draftGeomiDevApiKey, setDraftGeomiDevApiKey] = useState(
    geomiDevApiKeyOverride,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraftGeomiDevApiKey(geomiDevApiKeyOverride);
    }
  }, [geomiDevApiKeyOverride, open]);

  const hasChanges = useMemo(
    () =>
      normalizeGeomiDevApiKeyOverride(draftGeomiDevApiKey) !==
      geomiDevApiKeyOverride,
    [draftGeomiDevApiKey, geomiDevApiKeyOverride],
  );

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);

    try {
      setGeomiDevApiKeyOverride(draftGeomiDevApiKey);
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
              Saved only in this browser. When set, client-side explorer
              requests will use this geomi.dev key instead of the default
              bundled key.
            </Typography>
          </Box>

          <TextField
            autoComplete="off"
            fullWidth
            label="geomi.dev API key override"
            onChange={(event) => setDraftGeomiDevApiKey(event.target.value)}
            placeholder="Paste your geomi.dev API key"
            slotProps={{
              htmlInput: {
                spellCheck: false,
              },
            }}
            value={draftGeomiDevApiKey}
          />

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
          onClick={() => setDraftGeomiDevApiKey("")}
          disabled={isSaving || !draftGeomiDevApiKey}
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
