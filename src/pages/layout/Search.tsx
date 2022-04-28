import React from "react";
import {getTransaction} from "../../api";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import {styled, alpha} from "@mui/material/styles";
import {SafeRequestComponent} from "../../components/RequestComponent";
import {useGlobalState} from "../../GlobalState";
import {GetTransactionRequest, OnChainTransaction} from "../../api_client";
import {ResponseError, ResponseErrorType} from "../../api/client";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";
import {throttle} from "lodash";
import {Autocomplete, Stack, TextField} from "@mui/material";
import Divider from "@mui/material/Divider";
import {AccountLink} from "../Accounts/helpers";

const HEX_REGEXP = /^(0x)?[0-9a-fA-F]+$/;

const Search = styled("div")(({theme}) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  marginRight: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({theme}) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "22ch",
      "&:focus": {
        width: "24ch",
      },
    },
  },
}));

function SearchTransactionInner({
  data,
  error,
}: {
  data?: OnChainTransaction;
  error?: ResponseError;
}) {
  if (!data || error)
    // TODO: handle errors
    return null;
  return (
    <Link
      component={RRD.Link}
      to={`/txn/${data.version}`}
      color="inherit"
      underline="none"
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

  return (
    <Autocomplete
      forcePopupIcon={false}
      noOptionsText="Enter a transaction hash, version, Account Address or more to search!"
      getOptionLabel={(option) => ""}
      filterOptions={(x) => x.filter((x) => !!x)}
      options={options}
      onChange={(event, newValue) => null}
      onInputChange={(
        event: any,
        newInputValue: React.SetStateAction<string>,
      ) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => {
        params.fullWidth = false;
        params.InputProps.className = "";
        return (
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              ref={params.InputProps.ref}
              inputProps={{"aria-label": "search", ...params.inputProps}}
              placeholder="Search…"
            />
          </Search>
        );
      }}
      renderOption={(props, option) => {
        if (!option) return null;
        return (
          <li {...props}>
            <Stack
              direction="column"
              spacing={2}
              divider={<Divider orientation="horizontal" />}
            >
              {option}
            </Stack>
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

function SearchTransaction({txnHashOrVersion}: GetTransactionRequest) {
  const [state, _] = useGlobalState();

  return (
    <SafeRequestComponent
      request={(network: string) => getTransaction({txnHashOrVersion}, network)}
      args={[state.network_value]}
    >
      <SearchTransactionInner />
    </SafeRequestComponent>
  );
}

export default function HeaderSearch() {
  return <AutocompleteSearch />;
}
