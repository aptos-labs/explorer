import CheckIcon from "@mui/icons-material/Check";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import {
  Button,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import type {MouseEvent} from "react";
import {useState} from "react";
import {
  LOCALE_META,
  type LocalePreference,
  localeShortLabel,
  normalizeLocalePreference,
  SUPPORTED_LOCALES,
  useTranslation,
} from "../../i18n";
import {useExplorerSettings} from "../../settings";

function usePersistLocalePreference() {
  const {settings, setExplorerSettings} = useExplorerSettings();
  return {
    localePreference: settings.localePreference,
    persistLocalePreference: (value: string) => {
      setExplorerSettings({
        ...settings,
        localePreference: normalizeLocalePreference(value),
      });
    },
  };
}

function LocaleMenuItems({
  onSelect,
}: {
  onSelect: (preference: LocalePreference) => void;
}) {
  const {t} = useTranslation();
  const {localePreference} = usePersistLocalePreference();

  return (
    <>
      <MenuItem
        selected={localePreference === "auto"}
        onClick={() => onSelect("auto")}
      >
        <ListItemIcon sx={{minWidth: "1.75rem"}}>
          {localePreference === "auto" ? <CheckIcon fontSize="small" /> : null}
        </ListItemIcon>
        <ListItemText>{t("settings.language.auto")}</ListItemText>
      </MenuItem>
      {SUPPORTED_LOCALES.map((locale) => (
        <MenuItem
          key={locale}
          selected={localePreference === locale}
          onClick={() => onSelect(locale)}
        >
          <ListItemIcon sx={{minWidth: "1.75rem"}}>
            {localePreference === locale ? (
              <CheckIcon fontSize="small" />
            ) : null}
          </ListItemIcon>
          <ListItemText>{LOCALE_META[locale].nativeName}</ListItemText>
        </MenuItem>
      ))}
    </>
  );
}

function LocaleOptionsMenu({
  anchorEl,
  open,
  onClose,
  onSelect,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSelect: (preference: LocalePreference) => void;
}) {
  const {t} = useTranslation();
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      disableScrollLock
      disableAutoFocusItem
      disableRestoreFocus
      slotProps={{
        list: {
          "aria-label": t("settings.language.title"),
          dense: true,
        },
        paper: {
          sx: {maxHeight: 360},
        },
      }}
    >
      <LocaleMenuItems onSelect={onSelect} />
    </Menu>
  );
}

export function LanguageOverflowMenuItem({onPicked}: {onPicked: () => void}) {
  const {t, locale} = useTranslation();
  const {persistLocalePreference} = usePersistLocalePreference();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <MenuItem
        onClick={handleOpen}
        aria-haspopup="menu"
        aria-expanded={anchorEl ? "true" : undefined}
        aria-label={t("settings.language.title")}
      >
        <ListItemIcon sx={{minWidth: "1.75rem"}}>
          <LanguageOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={t("settings.language.title")}
          secondary={LOCALE_META[locale].nativeName}
        />
      </MenuItem>
      <LocaleOptionsMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onSelect={(preference) => {
          persistLocalePreference(preference);
          handleClose();
          onPicked();
        }}
      />
    </>
  );
}

export default function LanguageSelect({
  variant = "header",
}: {
  variant?: "header" | "settings";
}) {
  const {t, locale} = useTranslation();
  const {localePreference, persistLocalePreference} =
    usePersistLocalePreference();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isSettings = variant === "settings";
  const label = isSettings
    ? t("settings.language.label")
    : t("settings.language.title");
  const shortLabel = localeShortLabel(locale);

  const handleSelectChange = (event: SelectChangeEvent) => {
    persistLocalePreference(event.target.value);
  };

  if (isSettings) {
    return (
      <FormControl size="small" fullWidth>
        <InputLabel id="explorer-language-label">{label}</InputLabel>
        <Select
          labelId="explorer-language-label"
          label={label}
          value={localePreference}
          onChange={handleSelectChange}
          inputProps={{"aria-label": label}}
          MenuProps={{
            disableScrollLock: true,
            disableAutoFocusItem: true,
            disableRestoreFocus: true,
            sx: {
              "& .MuiPaper-root": {maxHeight: 360},
            },
          }}
        >
          <MenuItem value="auto">{t("settings.language.auto")}</MenuItem>
          {SUPPORTED_LOCALES.map((locale) => (
            <MenuItem key={locale} value={locale}>
              {LOCALE_META[locale].nativeName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <>
      {/* Keep the tooltip closed and non-interactive while the menu is open:
          its popper renders above the menu and would block the first option. */}
      <Tooltip
        title={label}
        disableTouchListener
        disableInteractive
        open={anchorEl ? false : undefined}
        slotProps={{
          popper: {
            sx: {pointerEvents: "none"},
          },
        }}
      >
        <Button
          color="inherit"
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={anchorEl ? "true" : undefined}
          startIcon={<LanguageOutlinedIcon fontSize="small" />}
          sx={{
            color: "inherit",
            flexShrink: 0,
            minWidth: 0,
            minHeight: {xs: 40, lg: 36},
            px: {xs: 0.75, lg: 1},
            touchAction: "manipulation",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.8125rem",
            letterSpacing: "0.02em",
            "& .MuiButton-startIcon": {mx: 0, mr: 0.5},
            "& .MuiButton-startIcon > svg": {fontSize: "1.15rem"},
          }}
        >
          {shortLabel}
        </Button>
      </Tooltip>
      <LocaleOptionsMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onSelect={(preference) => {
          persistLocalePreference(preference);
          setAnchorEl(null);
        }}
      />
    </>
  );
}
