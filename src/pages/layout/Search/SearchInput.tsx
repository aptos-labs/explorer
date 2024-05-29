import React from "react";
import {
  AutocompleteRenderInputParams,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchInputProps extends AutocompleteRenderInputParams {
  loading?: boolean;
}

export default function SearchInput({loading, ...params}: SearchInputProps) {
  return (
    <form style={{width: "100%"}}>
      <TextField
        {...params}
        InputProps={{
          sx: {
            fontSize: "1.1rem",
            lineHeight: "1.1rem",
          },
          "aria-label": "search",
          ...params.InputProps,
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{ml: 0.5, marginTop: "0!important"}}
            >
              <SearchIcon fontSize="large" color="secondary" />
            </InputAdornment>
          ),
          endAdornment: loading && (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ),
        }}
        placeholder="Search Explorer"
        helperText="Account Name or Address / Txn Hash or Version / Block Height or Version"
        fullWidth
      />
    </form>
  );
}
