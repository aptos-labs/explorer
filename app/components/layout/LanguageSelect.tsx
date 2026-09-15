import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  useTheme,
} from "@mui/material";
import {
  LOCALE_META,
  normalizeLocalePreference,
  SUPPORTED_LOCALES,
  useTranslation,
} from "../../i18n";
import {useExplorerSettings} from "../../settings";

export default function LanguageSelect({
  variant = "header",
}: {
  variant?: "header" | "settings";
}) {
  const theme = useTheme();
  const {t} = useTranslation();
  const {settings, setExplorerSettings} = useExplorerSettings();
  const isSettings = variant === "settings";
  const label = isSettings
    ? t("settings.language.label")
    : t("settings.language.title");

  const handleChange = (event: SelectChangeEvent) => {
    const localePreference = normalizeLocalePreference(event.target.value);
    setExplorerSettings({
      ...settings,
      localePreference,
    });
  };

  return (
    <FormControl
      size="small"
      fullWidth={isSettings}
      sx={
        isSettings ? undefined : {minWidth: 108, maxWidth: 148, flexShrink: 0}
      }
    >
      {isSettings ? (
        <InputLabel id="explorer-language-label">{label}</InputLabel>
      ) : null}
      <Select
        labelId={isSettings ? "explorer-language-label" : undefined}
        label={isSettings ? label : undefined}
        value={settings.localePreference}
        onChange={handleChange}
        displayEmpty={!isSettings}
        inputProps={{"aria-label": label}}
        MenuProps={{
          sx: {
            "& .MuiPaper-root": {maxHeight: 360},
          },
        }}
        sx={
          isSettings
            ? undefined
            : {
                color: theme.palette.text.primary,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.divider,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "& .MuiSelect-select": {
                  py: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }
        }
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
