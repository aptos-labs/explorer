import React from "react";
import {getTransaction} from "../../api";
import TextField from "@mui/material/TextField";
import {useQuery, UseQueryResult} from "react-query";
import {useGlobalState} from "../../GlobalState";
import {Types} from "aptos";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";
import {throttle} from "lodash";
import {Autocomplete} from "@mui/material";
import AccountLink from "../../components/AccountLink";
import Paper from "@mui/material/Paper";
import {useTheme} from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl, {useFormControl} from "@mui/material/FormControl";
import SvgIcon, {SvgIconProps} from "@mui/material/SvgIcon";
import {isHex} from "../utils";

const HEX_REGEXP = /^(0x)?[0-9a-fA-F]+$/;

function HomeIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M9.83154 0.995764C6.7039 0.997101 3.76603 2.49605 1.92881 5.0276C0.0913839 7.55942 -0.423672 10.8178 0.543418 13.7926C1.51078 16.7678 3.84294 19.1001 6.81763 20.0667C9.79212 21.033 13.0494 20.5167 15.5798 18.6779L20.4465 23.5462C20.8338 23.9336 21.3986 24.0849 21.9278 23.9432C22.457 23.8012 22.8703 23.3879 23.0122 22.8584C23.1539 22.329 23.0026 21.7641 22.6153 21.3766L17.7486 16.5084C19.1701 14.5541 19.8165 12.1421 19.5634 9.73858C19.31 7.3351 18.175 5.11102 16.3774 3.49602C14.5801 1.88101 12.2477 0.990138 9.83189 0.995477L9.83154 0.995764ZM9.83154 17.4785C8.05296 17.4785 6.34733 16.7718 5.08969 15.5138C3.83206 14.2557 3.12561 12.5496 3.12561 10.7704C3.12561 8.99125 3.83206 7.28507 5.08969 6.02703C6.34733 4.76899 8.05296 4.06232 9.83154 4.06232C11.6101 4.06232 13.3157 4.76899 14.5734 6.02703C15.831 7.28507 16.5375 8.99125 16.5375 10.7704C16.5353 12.5487 15.8283 14.2539 14.571 15.5114C13.3139 16.7691 11.6094 17.4764 9.83154 17.4785V17.4785Z" />
    </SvgIcon>
  );
}

function SearchTransactionInner({
  data,
  isError,
}: UseQueryResult<Types.Transaction>) {
  if (!data || isError) {
    return null;
  }

  if (!("version" in data)) {
    // TODO: pending transactions?
    return null;
  }
  const theme = useTheme();
  return (
    <Link
      component={RRD.Link}
      to={`/txn/${data.version}`}
      color="inherit"
      underline="none"
      sx={{
        padding: 0.5,
        display: "block",
        width: "100%",
        "&:hover": {
          // TODO: match link styles with Account result utilizing theme.palette
          backgroundColor: `${"transparent"}!important`,
          opacity: "0.8",
        },
      }}
    >
      Transaction {data.version}
    </Link>
  );
}

type OptionType = React.ReactNode[];

function AutocompleteSearch() {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState<OptionType>([]);

  const fetch = React.useMemo(
    () =>
      throttle(
        (searchText: string, callback: (results: OptionType) => void) => {
          callback(searchResults(searchText));
        },
        200,
      ),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setOptions([]);
      return;
    }

    fetch(inputValue, (results: OptionType) => {
      if (active) {
        setOptions(results);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetch]);

  // hide autocomplete dropdown until text has been entered
  const [open, setOpen] = React.useState(false);

  const theme = useTheme();

  return (
    <Autocomplete
      PaperComponent={({children}) => (
        <Paper
          sx={{
            borderTop: "0",
            p: 1,
            mx: 0.5,
            transform: "translateY(2px)",
            borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
            boxShadow: "0px 8px 8px -3px rgba(0,0,0,0.2)",
            zIndex: "200",
            position: "relative",
            "&.MuiPaper-root .MuiAutocomplete-listbox .MuiAutocomplete-option":
              {
                padding: 0,
                minHeight: 0,
              },
            "&.MuiPaper-root .MuiAutocomplete-listbox .MuiAutocomplete-option.Mui-focused":
              {
                background: "transparent",
              },
            "&.MuiPaper-root .MuiAutocomplete-listbox .MuiAutocomplete-option .MuiLink-root":
              {
                padding: 1,
                width: "100%",
              },
          }}
        >
          {children}
        </Paper>
      )}
      open={open}
      sx={{
        mb: {sm: 1, md: 2},
        flexGrow: 1,
        width: "100%",

        "&.MuiAutocomplete-root .MuiFilledInput-root": {
          py: 1.5,
          px: 2,
        },
        "&.MuiAutocomplete-root .MuiFormHelperText-root": {
          opacity: "0",
          mt: 0.5,
          mb: 0,
          fontFamily: "apparat",
          fontWeight: "light",
        },
        "&.Mui-focused .MuiFormHelperText-root": {
          opacity: "0.6",
        },
      }}
      forcePopupIcon={false}
      selectOnFocus={true}
      freeSolo
      clearOnBlur
      autoSelect={false}
      noOptionsText="No Results"
      getOptionLabel={(option) => ""}
      filterOptions={(x) => x.filter((x) => !!x)}
      options={options}
      inputValue={inputValue}
      onChange={(event, newValue) => null}
      onInputChange={(
        event: any,
        newInputValue: React.SetStateAction<string>,
        reason,
      ) => {
        if (newInputValue.length === 0) {
          if (open) setOpen(false);
        } else {
          if (!open) setOpen(true);
        }
        if (event && event.type === "blur") {
          setInputValue("");
        } else if (reason !== "reset") {
          setInputValue(newInputValue);
        }
      }}
      onClose={() => setOpen(false)}
      renderInput={(params) => {
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
                    <HomeIcon fontSize="medium" color="secondary" />
                  </InputAdornment>
                ),
              }}
              placeholder="Search transactions"
              helperText="Version ID, Hash or Account Address"
              fullWidth
            />
          </FormControl>
        );
      }}
      renderOption={(props, option) => {
        if (!option) return null;
        return <li {...props}>{option}</li>;
      }}
    />
  );
}

function searchResults(searchText: string) {
  searchText = searchText.trim();
  if (!HEX_REGEXP.test(searchText)) {
    // if it's not hexadecimal characters, no results
    return [];
  }
  const results = [
    <SearchTransaction
      key={`st-${searchText}`}
      txnHashOrVersion={searchText}
    />,
  ];
  // if it's hex, and is <= (64 + 2 for 0x) char long
  if (isHex(searchText)) {
    results.push(
      <AccountLink
        sx={{
          color: "inherit",
          "&:hover": {
            // TODO: match link styles with Transaction result utilizing theme.palette
            opacity: "0.8",
          },
          textDecoration: "none",
        }}
        key={`al-${searchText}`}
        address={searchText}
      />,
    );
  }
  return results;
}

function SearchTransaction({txnHashOrVersion}: {txnHashOrVersion: string}) {
  const [state, _] = useGlobalState();

  const result = useQuery(
    ["transaction", {txnHashOrVersion}, state.network_value],
    () => getTransaction({txnHashOrVersion}, state.network_value),
  );

  return <SearchTransactionInner {...result} />;
}

export default function HeaderSearch() {
  return <AutocompleteSearch />;
}
