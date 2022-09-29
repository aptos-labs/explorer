import React from "react";
import {FormControl, InputAdornment, TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchInput({...params}) {
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
        placeholder="Search transactions"
        helperText="Account Address / Txn Version & Hash / Block Height & Version"
        fullWidth
      />
    </FormControl>
  );
}
