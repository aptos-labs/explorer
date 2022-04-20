import React from "react";
import { getTransaction } from "../../api";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { styled, alpha } from "@mui/material/styles";
import { SafeRequestComponent } from "../../components/RequestComponent";
import { useGlobalState } from "../../GlobalState";
import { GetTransactionRequest, OnChainTransaction } from "../../api_client";
import { ResponseError, ResponseErrorType } from "../../api/client";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";
import { throttle } from "lodash";
import { Autocomplete, Stack, TextField } from "@mui/material";
import Divider from "@mui/material/Divider";
import { AccountLink } from "../Accounts/helpers";
import Paper from "@mui/material/Paper";
import { teal, grey } from '@mui/material/colors';
import { useTheme } from '@mui/material';

const HEX_REGEXP = /^(0x)?[0-9a-fA-F]+$/;

const Search = styled("div")(({ theme }) => ({
  position: "relative",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: "0.5",
  right: "0",
  top: "0"
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  padding: "0",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 4, 1, 1),
    // vertical padding + font size from searchIcon
    // paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    // transition: theme.transitions.create("width"),
    transition: "none",
    width: "100%",
    fontWeight: theme.typography.fontWeightLight,
    [theme.breakpoints.up("sm")]: {
      fontSize: "1rem",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "1.2rem",
    }
  },
}));

function SearchTransactionInner({ data, error }: { data?: OnChainTransaction, error?: ResponseError }) {
  if (!data || error)
    // TODO: handle errors
    return null;
  return (
    <Link component={RRD.Link}
      to={`/txn/${data.version}`}
      color="inherit"
      underline="none"
      sx={{
        padding: "8px", display: "block", borderRadius: "0.45em", width: "100%", opacity: "0.8", "&:hover": { background: teal['A400'], color: grey[900] },
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
    () => throttle(
      (searchText: string, callback: (results: OptionType) => void) => {
        callback(searchResults(searchText));
      }, 200),
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
      PaperComponent={({ children }) => (
        <Paper sx={{
          borderTop: "1px dotted grey",
          p: 1,
          transform: 'translateY(-8px)',
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 50px 50px -12px rgba(0, 0, 0, 0.75)"
        }}>
          {children}
        </Paper>
      )}

      open={open}
      sx={{ flexGrow: 1 }}
      forcePopupIcon={false}
      selectOnFocus={true}
      noOptionsText="No Results"
      getOptionLabel={(option) => ""}
      filterOptions={(x) => x.filter((x) => !!x)}
      options={options}
      inputValue={inputValue}
      onChange={(event, newValue) => null}
      onInputChange={(event: any, newInputValue: React.SetStateAction<string>, reason) => {
        if (newInputValue.length === 0) {
          if (open) setOpen(false);
        } else {
          if (!open) setOpen(true);
        }
        if (event && event.type === 'blur') {
          setInputValue('');
        } else if (reason !== 'reset') {
          setInputValue(newInputValue);
        }
      }}
      onClose={() => setOpen(false)}
      renderInput={(params) => {
        params.fullWidth = true;
        params.InputProps.className = "";
        return (
          <Search>
            <Paper sx={{ mt: { xs: 8, md: 14 }, mb: { xs: 4, md: 8 } }} >
              <SearchIconWrapper>
                <SearchIcon sx={{ width: "2rem", height: "2rem" }} />
              </SearchIconWrapper>
              <StyledInputBase sx={{ p: 2 }} ref={params.InputProps.ref}
                inputProps={{ "aria-label": "search", ...params.inputProps }}
                placeholder="Search by Transaction Hash, Version, Account Address…"
              />
            </Paper>
          </Search>
        );
      }}
      renderOption={(props, option) => {
        if (!option)
          return null;
        return (
          <li {...props}>

            {option}

          </li>
        );
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
    <SearchTransaction key={`st-${searchText}`} txnHashOrVersion={searchText}/>
  ];
  // if it's hex, and is <= (64 + 2 for 0x) char long
  if (searchText.startsWith("0x") && searchText.length <= 66) {
    results.push(
      <AccountLink key={`al-${searchText}`} address={searchText}/>
    );
  }
  return results;
}

function SearchTransaction({ txnHashOrVersion }: GetTransactionRequest) {
  const [state, _] = useGlobalState();

  return (
    <SafeRequestComponent
      request={(network: string) => getTransaction({ txnHashOrVersion }, network)}
      args={[state.network_value]}
    >
      <SearchTransactionInner/>
    </SafeRequestComponent>
  );
}

export default function HeaderSearch() {
  return (
    <AutocompleteSearch/>
  );
}