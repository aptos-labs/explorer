import React, {useEffect, useState} from "react";
import {Autocomplete, AutocompleteInputChangeReason} from "@mui/material";
import SearchInput from "./SearchInput";
import {useNavigate} from "react-router-dom";
import useGetSearchResults, {
  NotFoundResult,
  SearchResult,
} from "../../../api/hooks/useGetSearchResults";
import ResultLink from "./ResultLink";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<SearchResult>(NotFoundResult);

  const options = useGetSearchResults(inputValue);

  useEffect(() => {
    if (options.length > 1) {
      setSelectedOption(options[0]);
    }
  }, [options]);

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
    if (selectedOption.to !== null) {
      navigate(selectedOption.to);
    }
  };

  return (
    <Autocomplete
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
      autoHighlight
      handleHomeEndKeys
      forcePopupIcon={false}
      selectOnFocus={true}
      freeSolo
      clearOnBlur
      autoSelect={false}
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
        return (
          <li {...props} key={props.id}>
            <ResultLink to={option.to} text={option.label} />
          </li>
        );
      }}
      onHighlightChange={(event, option) => {
        if (option !== null) {
          const optionCopy = Object.assign({}, option);
          setSelectedOption(optionCopy);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleSubmitSearch();
          event.preventDefault();
        }
      }}
    />
  );
}
