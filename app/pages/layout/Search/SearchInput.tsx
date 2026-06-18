import SearchIcon from "@mui/icons-material/Search";
import {
  type AutocompleteRenderInputParams,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  SEARCH_HELPER_TEXT,
  SEARCH_ICON_COLOR,
  SEARCH_INPUT_FONT_SIZE,
  SEARCH_PLACEHOLDER,
} from "./searchConstants";

interface SearchInputProps extends AutocompleteRenderInputParams {
  loading?: boolean;
}

export default function SearchInput({loading, ...params}: SearchInputProps) {
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
            "aria-label": "search",
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
        placeholder={SEARCH_PLACEHOLDER}
        helperText={SEARCH_HELPER_TEXT}
        fullWidth
      />
    </form>
  );
}
