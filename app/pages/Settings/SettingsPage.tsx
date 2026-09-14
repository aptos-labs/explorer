import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
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
import {
  InlineMarkup,
  LOCALE_META,
  normalizeLocalePreference,
  SUPPORTED_LOCALES,
  useTranslation,
} from "../../i18n";
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
  const {t, tList} = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const {settings, setExplorerSettings} = useExplorerSettings();
  const [draftSettings, setDraftSettings] =
    useState<ExplorerClientSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
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

  return (
    <Box>
      <PageMetadata
        title={t("settings.title")}
        description={t("settings.metaDescription")}
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
          {t("settings.title")}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mb: 4,
          }}
        >
          {t("settings.description")}
        </Typography>

        <Stack spacing={4}>
          <Paper variant="outlined" sx={{p: 3}}>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {t("settings.language.title")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.5,
                    mb: 2,
                  }}
                >
                  <InlineMarkup text={t("settings.language.description")} />
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="explorer-language-label">
                    {t("settings.language.label")}
                  </InputLabel>
                  <Select
                    labelId="explorer-language-label"
                    label={t("settings.language.label")}
                    value={draftSettings.localePreference}
                    onChange={(event) =>
                      setDraftSettings((current) => ({
                        ...current,
                        localePreference: normalizeLocalePreference(
                          event.target.value,
                        ),
                      }))
                    }
                  >
                    <MenuItem value="auto">
                      {t("settings.language.auto")}
                    </MenuItem>
                    {SUPPORTED_LOCALES.map((locale) => (
                      <MenuItem key={locale} value={locale}>
                        {LOCALE_META[locale].nativeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Paper>

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
                    {t("settings.decompilation.title")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    {t("settings.decompilation.description")}
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
                      "aria-label": t("settings.decompilation.ariaLabel"),
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
                  {t("settings.decompilation.disclaimerTitle")}
                </Typography>
                <Typography variant="body2">
                  <InlineMarkup
                    text={t("settings.decompilation.disclaimerIntro")}
                  />
                </Typography>
                <Box component="ul" sx={{mt: 1, mb: 0, pl: 2}}>
                  {tList("settings.decompilation.bullets").map((item) => (
                    <li key={item}>
                      <Typography variant="body2">
                        <InlineMarkup text={item} />
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Alert>
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
                    {t("settings.apiKeys.title")}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={t("settings.apiKeys.whyAriaLabel")}
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
                    {t("settings.apiKeys.popover")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    <InlineMarkup text={t("settings.apiKeys.popoverManage")} />
                  </Typography>
                </Popover>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mt: 0.5,
                  }}
                >
                  {t("settings.apiKeys.description")}
                </Typography>
              </Box>

              {SETTINGS_NETWORKS.map((network) => (
                <TextField
                  key={network}
                  autoComplete="off"
                  fullWidth
                  label={t("settings.apiKeys.fieldLabel", {
                    network: networkLabel(network),
                  })}
                  onChange={(event) =>
                    updateOverride(network, event.target.value)
                  }
                  placeholder={t("settings.apiKeys.fieldPlaceholder", {
                    network: networkLabel(network),
                  })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showApiKeys
                                ? t("settings.apiKeys.hideKeys")
                                : t("settings.apiKeys.showKeys")
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
                <InlineMarkup text={t("settings.apiKeys.getKey")} />
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
                label={t("settings.apiKeys.remember")}
              />

              <Alert severity="warning">
                {t("settings.apiKeys.rememberWarning")}
              </Alert>

              <Alert severity="info">
                <InlineMarkup text={t("settings.apiKeys.notStored")} />
              </Alert>

              <Alert severity="info">{t("settings.apiKeys.refreshNote")}</Alert>
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
              {t("settings.actions.reset")}
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
              {t("settings.actions.restoreDefaults")}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isSaving || !hasChanges}
            >
              {t("settings.actions.save")}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
