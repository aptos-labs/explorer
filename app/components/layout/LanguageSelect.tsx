import CheckIcon from "@mui/icons-material/Check";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import {
  Box,
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
  AUTO_LOCALE_SHORT_LABEL,
  isSupportedLocale,
  LANGUAGE_PICKER_LOCALES,
  LOCALE_META,
  type LocalePreference,
  localePickerRowLabel,
  localeShortLabel,
  normalizeLocalePreference,
  type SupportedLocale,
  useTranslation,
} from "../../i18n";
import {useExplorerSettings} from "../../settings";

function NameWithCode({name, code}: {name: string; code: string}) {
  return (
    <Box
      component="span"
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 1.5,
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box component="span" sx={{minWidth: 0}}>
        {name}
      </Box>
      <Box
        component="span"
        sx={{
          color: "text.secondary",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          flexShrink: 0,
          marginInlineStart: "auto",
        }}
      >
        {code}
      </Box>
    </Box>
  );
}

function LocaleNameWithCode({locale}: {locale: SupportedLocale}) {
  return (
    <NameWithCode
      name={LOCALE_META[locale].nativeName}
      code={localeShortLabel(locale)}
    />
  );
}

function autoPreferenceLabel(autoName: string): string {
  return `${autoName} ${AUTO_LOCALE_SHORT_LABEL}`;
}

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
  const autoLabel = t("settings.language.auto");

  return (
    <>
      <MenuItem
        selected={localePreference === "auto"}
        aria-label={autoPreferenceLabel(autoLabel)}
        onClick={() => onSelect("auto")}
      >
        <ListItemIcon sx={{minWidth: "1.75rem"}}>
          {localePreference === "auto" ? <CheckIcon fontSize="small" /> : null}
        </ListItemIcon>
        <ListItemText
          primary={
            <NameWithCode name={autoLabel} code={AUTO_LOCALE_SHORT_LABEL} />
          }
          slotProps={{
            primary: {component: "div", sx: {width: "100%"}},
          }}
        />
      </MenuItem>
      {LANGUAGE_PICKER_LOCALES.map((locale) => (
        <MenuItem
          key={locale}
          selected={localePreference === locale}
          aria-label={localePickerRowLabel(locale)}
          onClick={() => onSelect(locale)}
        >
          <ListItemIcon sx={{minWidth: "1.75rem"}}>
            {localePreference === locale ? (
              <CheckIcon fontSize="small" />
            ) : null}
          </ListItemIcon>
          <ListItemText
            primary={<LocaleNameWithCode locale={locale} />}
            slotProps={{
              primary: {component: "div", sx: {width: "100%"}},
            }}
          />
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
  const shortLabel =
    localePreference === "auto"
      ? AUTO_LOCALE_SHORT_LABEL
      : localeShortLabel(locale);
  const autoLabel = t("settings.language.auto");

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
          renderValue={(value) => {
            if (value === "auto") {
              return t("settings.language.auto");
            }
            if (isSupportedLocale(value)) {
              return LOCALE_META[value].nativeName;
            }
            return value;
          }}
          MenuProps={{
            disableScrollLock: true,
            disableAutoFocusItem: true,
            disableRestoreFocus: true,
            sx: {
              "& .MuiPaper-root": {maxHeight: 360},
            },
          }}
        >
          <MenuItem value="auto" aria-label={autoPreferenceLabel(autoLabel)}>
            <NameWithCode name={autoLabel} code={AUTO_LOCALE_SHORT_LABEL} />
          </MenuItem>
          {LANGUAGE_PICKER_LOCALES.map((locale) => (
            <MenuItem
              key={locale}
              value={locale}
              aria-label={localePickerRowLabel(locale)}
            >
              <LocaleNameWithCode locale={locale} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <>
      <Tooltip title={anchorEl ? "" : label} disableTouchListener>
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
