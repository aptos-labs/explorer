import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Paper,
  Popover,
  Select,
  type SelectChangeEvent,
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
import {
  AI_PROVIDER_OPTIONS,
  type AiProviderId,
  getAiProviderOption,
} from "../../lib/ai/providers";
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
  const [showAiApiKey, setShowAiApiKey] = useState(false);
  const [apiKeyInfoAnchor, setApiKeyInfoAnchor] = useState<HTMLElement | null>(
    null,
  );
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

  const handleAiProviderChange = (event: SelectChangeEvent) => {
    const nextProvider = event.target.value as AiProviderId;
    setDraftSettings((current) => {
      const previous = getAiProviderOption(current.aiProvider);
      const next = getAiProviderOption(nextProvider);
      const modelIsDefault =
        !current.aiModel || current.aiModel === previous.defaultModel;
      const baseUrlIsDefault =
        !current.aiBaseUrl || current.aiBaseUrl === previous.defaultBaseUrl;
      return {
        ...current,
        aiProvider: nextProvider,
        aiModel: modelIsDefault ? next.defaultModel : current.aiModel,
        aiBaseUrl: baseUrlIsDefault ? next.defaultBaseUrl : current.aiBaseUrl,
      };
    });
  };

  return (
    <Box>
      <PageMetadata
        title="Settings"
        description="Configure Aptos Explorer settings including API keys, decompilation preferences, experimental AI descriptions, and other options."
        type="website"
      />
      <PageHeader />
      <Container maxWidth="md" sx={{py: 4}}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
          }}
        >
          Settings
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: 4,
          }}
        >
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
                sx={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Move Bytecode Decompilation
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                    }}
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
                  slotProps={{
                    input: {
                      "aria-label": "Enable Move bytecode decompilation",
                    },
                  }}
                />
              </Stack>

              <Alert
                severity="warning"
                icon={<WarningAmberIcon fontSize="small" />}
              >
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                  }}
                >
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

          {/* Experimental AI descriptions */}
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderColor: draftSettings.enableAiTransactionDescriptions
                ? theme.palette.success.main
                : theme.palette.divider,
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{alignItems: "center", flexWrap: "wrap", rowGap: 1}}
                  >
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                      AI transaction descriptions
                    </Typography>
                    <Chip
                      label="Experimental"
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    Opt in to describe user transactions with your own model.
                    The explorer gathers Move source, script bytecode (when
                    present), and transaction inputs/outputs in your browser,
                    then calls the provider you configure. Credentials are
                    stored only in this browser and are never sent to Aptos
                    Explorer servers.
                  </Typography>
                </Box>
                <Switch
                  checked={draftSettings.enableAiTransactionDescriptions}
                  onChange={(event) =>
                    setDraftSettings((current) => ({
                      ...current,
                      enableAiTransactionDescriptions: event.target.checked,
                    }))
                  }
                  slotProps={{
                    input: {
                      "aria-label":
                        "Enable experimental AI transaction descriptions",
                    },
                  }}
                />
              </Stack>

              <Alert
                severity="warning"
                icon={<WarningAmberIcon fontSize="small" />}
              >
                <Typography variant="body2" gutterBottom sx={{fontWeight: 600}}>
                  Experimental — please read before enabling
                </Typography>
                <Typography variant="body2">
                  Descriptions are generated by a third-party model and can be
                  incomplete or wrong. Source may be decompiled from bytecode
                  when published source is missing. Your API key is sent only
                  from this browser to the provider endpoint you set (not to
                  explorer.aptoslabs.com). Official OpenAI endpoints may block
                  browser calls (CORS); Anthropic, Gemini, OpenRouter, Groq, and
                  many OpenAI-compatible proxies work. HTTPS pages cannot call
                  HTTP localhost (Ollama) because of mixed content.
                </Typography>
              </Alert>

              {draftSettings.enableAiTransactionDescriptions ? (
                <Stack spacing={2.5}>
                  <FormControl fullWidth>
                    <InputLabel id="ai-provider-label">Provider</InputLabel>
                    <Select
                      labelId="ai-provider-label"
                      label="Provider"
                      value={draftSettings.aiProvider}
                      onChange={handleAiProviderChange}
                    >
                      {AI_PROVIDER_OPTIONS.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Model"
                    onChange={(event) =>
                      setDraftSettings((current) => ({
                        ...current,
                        aiModel: event.target.value,
                      }))
                    }
                    placeholder={
                      getAiProviderOption(draftSettings.aiProvider)
                        .defaultModel || "model-id"
                    }
                    value={draftSettings.aiModel}
                    slotProps={{
                      htmlInput: {spellCheck: false},
                    }}
                  />

                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Base URL"
                    helperText={
                      getAiProviderOption(draftSettings.aiProvider)
                        .baseUrlHelper
                    }
                    onChange={(event) =>
                      setDraftSettings((current) => ({
                        ...current,
                        aiBaseUrl: event.target.value,
                      }))
                    }
                    placeholder={
                      getAiProviderOption(draftSettings.aiProvider)
                        .defaultBaseUrl || "https://openrouter.ai/api/v1"
                    }
                    value={draftSettings.aiBaseUrl}
                    slotProps={{
                      htmlInput: {spellCheck: false},
                    }}
                  />

                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="API key"
                    onChange={(event) =>
                      setDraftSettings((current) => ({
                        ...current,
                        aiApiKey: event.target.value,
                      }))
                    }
                    placeholder="Paste your provider API key"
                    type={showAiApiKey ? "text" : "password"}
                    value={draftSettings.aiApiKey}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showAiApiKey
                                  ? "Hide AI API key"
                                  : "Show AI API key"
                              }
                              edge="end"
                              onClick={() => setShowAiApiKey((v) => !v)}
                            >
                              {showAiApiKey ? (
                                <VisibilityOffIcon />
                              ) : (
                                <VisibilityIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                      htmlInput: {spellCheck: false},
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={draftSettings.rememberAiApiKey}
                        onChange={(event) =>
                          setDraftSettings((current) => ({
                            ...current,
                            rememberAiApiKey: event.target.checked,
                          }))
                        }
                      />
                    }
                    label="Remember AI API key on this device"
                  />

                  <Alert severity="info">
                    The key is stored only in this browser (session unless you
                    remember it). Transaction description requests use{" "}
                    <code>fetch</code> from the page to your provider, with{" "}
                    <code>credentials: &quot;omit&quot;</code> so explorer
                    cookies are not sent.
                  </Alert>
                </Stack>
              ) : null}
            </Stack>
          </Paper>

          {/* API Overrides Section */}
          <Paper variant="outlined" sx={{p: 3}}>
            <Stack spacing={2.5}>
              <Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    API Key Overrides
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label="Why use your own API key?"
                    aria-expanded={Boolean(apiKeyInfoAnchor)}
                    aria-haspopup="true"
                    onClick={(event) =>
                      setApiKeyInfoAnchor(
                        apiKeyInfoAnchor ? null : event.currentTarget,
                      )
                    }
                    sx={{color: "text.secondary"}}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Popover
                  open={Boolean(apiKeyInfoAnchor)}
                  anchorEl={apiKeyInfoAnchor}
                  onClose={() => setApiKeyInfoAnchor(null)}
                  anchorOrigin={{vertical: "bottom", horizontal: "left"}}
                  transformOrigin={{vertical: "top", horizontal: "left"}}
                  slotProps={{
                    paper: {
                      sx: {maxWidth: 360, p: 2},
                    },
                  }}
                >
                  <Typography variant="body2" sx={{mb: 1.5}}>
                    The explorer uses a shared geomi.dev API key by default.
                    Adding your own key gives you a dedicated rate limit, which
                    helps if you browse heavily or hit HTTP 429 responses.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Create and manage keys at{" "}
                    <MuiLink
                      href="https://geomi.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      geomi.dev
                    </MuiLink>
                    .
                  </Typography>
                </Popover>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.5,
                  }}
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

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
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
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "flex-end",
            }}
          >
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
