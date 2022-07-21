import React from "react";
import {getTransaction} from "../../api";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/SearchRounded";
import {useQuery, UseQueryResult} from "react-query";
import {useGlobalState} from "../../GlobalState";
import {Types} from "aptos";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";
import {throttle} from "lodash";
import {Autocomplete} from "@mui/material";
import {AccountLink} from "../Accounts/helpers";
import Paper from "@mui/material/Paper";
import {teal, grey} from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import InputAdornment from '@mui/material/InputAdornment';

const HEX_REGEXP = /^(0x)?[0-9a-fA-F]+$/;



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
        padding: "8px",
        display: "block",
        width: "100%",
        opacity: "0.8",
        "&:hover": { backgroundColor: `${theme.palette.mode === 'dark' ? grey[800] : grey[200]}!important`},
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
      fullWidth
      PaperComponent={({children}) => (
        <Paper
          sx={{
            borderTop: "0",
            p: 1,
            transform: "translateY(8px)",
            borderRadius: "8px",
            boxShadow: '10px 25px 50px -12px rgba(23,23,23,0.25)', zIndex: '200',position: 'relative',
            mx:0.5,
          }}
        >
          {children}
        </Paper>
      )}
      open={open}
      sx={{ flexGrow: 1, }}
      forcePopupIcon={false}
      selectOnFocus={true}
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
          <TextField
            sx={{ mb:8 }}
            {...params}
            InputProps={{
              sx: {
                fontSize: '1.25rem',
                lineHeight: '1.25rem',
              },
              "aria-label": "search", 
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="large" color="secondary" sx={{ ml:0.5 }} />
                </InputAdornment>
              ),
            }}
            placeholder="Search by Transaction Hash, Version, Account Address…"
            fullWidth
          />

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
  if (searchText.startsWith("0x") && searchText.length <= 66) {
    results.push(<AccountLink key={`al-${searchText}`} address={searchText} />);
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
