import React from "react";
import {
  FormControl,
  InputAdornment,
  SvgIcon,
  SvgIconProps,
  TextField,
} from "@mui/material";

function SearchIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9.83154 0.995764C6.7039 0.997101 3.76603 2.49605 1.92881 5.0276C0.0913839 7.55942 -0.423672 10.8178 0.543418 13.7926C1.51078 16.7678 3.84294 19.1001 6.81763 20.0667C9.79212 21.033 13.0494 20.5167 15.5798 18.6779L20.4465 23.5462C20.8338 23.9336 21.3986 24.0849 21.9278 23.9432C22.457 23.8012 22.8703 23.3879 23.0122 22.8584C23.1539 22.329 23.0026 21.7641 22.6153 21.3766L17.7486 16.5084C19.1701 14.5541 19.8165 12.1421 19.5634 9.73858C19.31 7.3351 18.175 5.11102 16.3774 3.49602C14.5801 1.88101 12.2477 0.990138 9.83189 0.995477L9.83154 0.995764ZM9.83154 17.4785C8.05296 17.4785 6.34733 16.7718 5.08969 15.5138C3.83206 14.2557 3.12561 12.5496 3.12561 10.7704C3.12561 8.99125 3.83206 7.28507 5.08969 6.02703C6.34733 4.76899 8.05296 4.06232 9.83154 4.06232C11.6101 4.06232 13.3157 4.76899 14.5734 6.02703C15.831 7.28507 16.5375 8.99125 16.5375 10.7704C16.5353 12.5487 15.8283 14.2539 14.571 15.5114C13.3139 16.7691 11.6094 17.4764 9.83154 17.4785V17.4785Z" />
    </SvgIcon>
  );
}

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
              <SearchIcon fontSize="medium" color="secondary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search transactions"
        helperText="Version ID, Hash or Account Address"
        fullWidth
      />
    </FormControl>
  );
}
