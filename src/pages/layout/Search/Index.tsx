import React, {useState, useEffect, useMemo} from "react";
import {throttle} from "lodash";
import {Autocomplete, AutocompleteInputChangeReason} from "@mui/material";
import SearchTransaction from "./SearchTransaction";
import SearchAccount from "./SearchAccount";
import SearchInput from "./SearchInput";
import ResultPaper from "./ResultPaper";
import SearchResultNotFound from "./SearchResultNotFound";
import SearchBlockByHeight from "./SearchBlockByHeight";
import SearchBlockByVersion from "./SearchBlockByVersion";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import {getAccount, getTransaction} from "../../../api";
import {useGlobalState} from "../../../GlobalState";
import {useNavigate} from "react-router-dom";

const HEX_REGEXP = /^(0x)?[0-9a-fA-F]+$/;

type OptionType = React.ReactNode[];

function getSearchResults(searchText: string, inDev: boolean): OptionType {
  searchText = searchText.trim();

  if (!HEX_REGEXP.test(searchText)) {
    // if it's not hexadecimal characters, no results
    return [<SearchResultNotFound />];
  }

  const results = [
    <SearchAccount address={searchText} />,
    <SearchTransaction txnHashOrVersion={searchText} />,
  ];

  if (inDev) {
    results.push(
      <SearchBlockByHeight height={searchText} />,
      <SearchBlockByVersion version={searchText} />,
    );
  }

  if (results.length === 0) {
    return [<SearchResultNotFound />];
  } else {
    return results;
  }
}

export default function HeaderSearch() {
  const inDev = useGetInDevMode();
  const navigate = useNavigate();
  const [state, _] = useGlobalState();
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<OptionType>([]);

  const fetch = useMemo(
    () =>
      throttle(
        (searchText: string, callback: (results: OptionType) => void) => {
          callback(getSearchResults(searchText, inDev));
        },
        200,
      ),
    [],
  );

  useEffect(() => {
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
  const [open, setOpen] = useState(false);

  const handleInputChange = (
    event: any,
    newInputValue: React.SetStateAction<string>,
    reason: AutocompleteInputChangeReason,
  ) => {
    if (newInputValue.length === 0) {
      if (open) {
        setOpen(false);
      }
    } else {
      if (!open) {
        setOpen(true);
      }
    }

    if (event && event.type === "blur") {
      setInputValue("");
    } else if (reason !== "reset") {
      setInputValue(newInputValue);
    }
  };

  const handleSubmitSearch = async () => {
    const accountPromise = getAccount(
      {address: inputValue},
      state.network_value,
    )
      .then(() => {
        return true;
      })
      .catch(() => {
        // Do nothing. It's expected that not all search input is a valid account
      });

    const transactionPromise = getTransaction(
      {txnHashOrVersion: inputValue},
      state.network_value,
    )
      .then(() => {
        return true;
      })
      .catch(() => {
        // Do nothing. It's expected that not all search input is a valid account
      });

    const [isAccount, isTxn] = await Promise.all([
      accountPromise,
      transactionPromise,
    ]);

    if (isAccount) {
      navigate(`/account/${inputValue}`);
      return;
    }

    if (isTxn) {
      navigate(`/txn/${inputValue}`);
      return;
    }
  };

  return (
    <Autocomplete
      PaperComponent={({children}) => <ResultPaper>{children}</ResultPaper>}
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
      onInputChange={handleInputChange}
      onClose={() => setOpen(false)}
      renderInput={(params) => {
        return <SearchInput {...params} />;
      }}
      renderOption={(props, option) => {
        if (!option) return null;
        return <li {...props}>{option}</li>;
      }}
      onSubmit={(event) => {
        handleSubmitSearch();
        event.preventDefault();
      }}
    />
  );
}
