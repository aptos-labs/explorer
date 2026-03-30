import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "@tanstack/react-router";
import {useEffect, useMemo, useRef, useState} from "react";
import {clearCachedSearchClients} from "../../api/createClient";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {emitApiKeySaved} from "../../context/rate-limit";
import {clearCachedV2Clients} from "../../global-config";
import {type NetworkName, networks} from "../../lib/constants";
import {
  defaultExplorerClientSettings,
  type ExplorerClientSettings,
  normalizeGeomiDevApiKeyOverride,
  sanitizeExplorerClientSettings,
  useExplorerSettings,
} from "../../settings";
import PageHeader from "../layout/PageHeader";

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

export default function SettingsPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const {settings, setExplorerSettings} = useExplorerSettings();
  const [draftSettings, setDraftSettings] =
    useState<ExplorerClientSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const initialSettingsRef = useRef(settings);

  useEffect(() => {
    initialSettingsRef.current = settings;
    setDraftSettings(settings);
  }, [settings]);

  const hasChanges = useMemo(
    () => !settingsEqual(draftSettings, settings),
    [draftSettings, settings],
  );

  const handleSave = async () => {
    if (!hasChanges) return;
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDraftSettings(settings);
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
    <Box>
      <PageMetadata
        title="Settings"
        description="Configure Aptos Explorer settings including API keys, decompilation preferences, and other options."
        type="website"
      />
      <PageHeader />
      <Container maxWidth="md" sx={{py: 4}}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
          Manage your explorer preferences. Settings are stored locally in your
          browser.
        </Typography>

        <Stack spacing={4}>
          {/* Decompilation Section */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderColor: draftSettings.enableDecompilation
                ? theme.palette.success.main
                : theme.palette.divider,
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Move Bytecode Decompilation
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mt: 0.5}}
                  >
                    Enable client-side decompilation of on-chain Move bytecode
                    into human-readable source. Runs entirely in your browser
                    via WebAssembly.
                  </Typography>
                </Box>
                <Switch
                  checked={draftSettings.enableDecompilation}
                  onChange={(event) =>
                    setDraftSettings((current) => ({
                      ...current,
                      enableDecompilation: event.target.checked,
                    }))
                  }
                  inputProps={{
                    "aria-label": "Enable Move bytecode decompilation",
                  }}
                />
              </Stack>

              <Alert
                severity="warning"
                icon={<WarningAmberIcon fontSize="small" />}
              >
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Disclaimer — Please read before enabling
                </Typography>
                <Typography variant="body2">
                  Decompiled output is generated mechanically from on-chain
                  bytecode and <strong>may not match</strong> the original
                  source code. Variable names, comments, and some structural
                  details are lost during compilation and cannot be recovered.
                  By enabling this feature you acknowledge that:
                </Typography>
                <Box component="ul" sx={{mt: 1, mb: 0, pl: 2}}>
                  <li>
                    <Typography variant="body2">
                      The decompiled output is provided{" "}
                      <strong>as-is for informational purposes only</strong>.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      You accept responsibility for how you use the decompiled
                      output.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      The output should not be treated as the definitive or
                      authoritative source code for any on-chain module.
                    </Typography>
                  </li>
                </Box>
              </Alert>
            </Stack>
          </Paper>

          {/* API Overrides Section */}
          <Paper variant="outlined" sx={{p: 3}}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  API Key Overrides
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{mt: 0.5}}
                >
                  Optional geomi.dev API keys per network. Used only in your
                  browser. Leave a network empty to use the default key from the
                  build (if any). By default, overrides are stored for the
                  current browser session and cleared when the session ends.
                </Typography>
              </Box>

              {SETTINGS_NETWORKS.map((network) => (
                <TextField
                  key={network}
                  autoComplete="off"
                  fullWidth
                  label={`${networkLabel(network)} API key`}
                  onChange={(event) =>
                    updateOverride(network, event.target.value)
                  }
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
                            onClick={() => setShowApiKeys((v) => !v)}
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
                    draftSettings.geomiDevApiKeyOverridesByNetwork[network] ??
                    ""
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
                      setDraftSettings((current) => ({
                        ...current,
                        rememberGeomiDevApiKeyOverride: event.target.checked,
                      }))
                    }
                  />
                }
                label="Remember API keys on this device"
              />

              <Alert severity="warning">
                Remembering keys stores them in this browser&apos;s local
                storage. Avoid enabling this on shared or untrusted devices.
              </Alert>

              <Alert severity="info">
                Keys are not stored by the explorer application server. Your
                browser uses them only for client-side API requests. For best
                security, use client keys with only the origin{" "}
                <code>https://explorer.aptoslabs.com</code> enabled and
                enforced.
              </Alert>

              <Alert severity="info">
                Existing data will refresh after save so new requests use the
                updated keys immediately.
              </Alert>
            </Stack>
          </Paper>

          <Divider />

          {/* Save / Reset actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={handleReset}
              disabled={isSaving || !hasChanges}
              variant="outlined"
            >
              Reset
            </Button>
            <Button
              onClick={() =>
                setDraftSettings({
                  ...defaultExplorerClientSettings,
                })
              }
              disabled={isSaving}
              variant="outlined"
              color="warning"
            >
              Restore Defaults
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isSaving || !hasChanges}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
