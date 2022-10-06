import React from "react";
import {
  FormControl,
  InputAdornment,
  TextField,
  StandardTextFieldProps,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchInputProps extends StandardTextFieldProps {
  onEnterPress: () => void;
}

export default function SearchInput({
  onEnterPress,
  ...params
}: SearchInputProps) {
  return (
    <FormControl sx={{width: "100%"}}>
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
        }}
        placeholder="Search Explorer"
        helperText="Account Address / Txn Hash or Version / Block Height or Version"
        fullWidth
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            onEnterPress();
          }
        }}
      />
    </FormControl>
  );
}
