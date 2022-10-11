import React, {useState} from "react";
import {Autocomplete, AutocompleteInputChangeReason} from "@mui/material";
import SearchInput from "./SearchInput";
import {useNavigate} from "react-router-dom";
import useGetSearchResults from "../../../api/hooks/useGetSearchResults";
import ResultLink from "./ResultLink";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>("");
  const [open, setOpen] = useState(false);

  const options = useGetSearchResults(inputValue);

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
    if (options.length > 0 && options[0].to !== null) {
      navigate(options[0].to);
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
      onSubmit={(event) => {
        handleSubmitSearch();
        event.preventDefault();
      }}
    />
  );
}
