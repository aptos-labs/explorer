import SearchIcon from "@mui/icons-material/Search";
import {
  type AutocompleteRenderInputParams,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import {SEARCH_ICON_COLOR, SEARCH_INPUT_FONT_SIZE} from "./searchConstants";
import {useTranslation} from "../../../i18n";

interface SearchInputProps extends AutocompleteRenderInputParams {
  loading?: boolean;
}

export default function SearchInput({loading, ...params}: SearchInputProps) {
  const {t} = useTranslation();

  return (
    <form style={{width: "100%"}}>
      <TextField
        {...params}
        slotProps={{
          ...params.slotProps,
          input: {
            ...params.slotProps.input,
            sx: {
              fontSize: SEARCH_INPUT_FONT_SIZE,
              lineHeight: SEARCH_INPUT_FONT_SIZE,
            },
            "aria-label": t("search.ariaLabel"),
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ml: 0.5, marginTop: "0!important"}}
              >
                <SearchIcon fontSize="large" color={SEARCH_ICON_COLOR} />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          },
        }}
        placeholder={t("search.placeholder")}
        helperText={t("search.helper")}
        fullWidth
      />
    </form>
  );
}
