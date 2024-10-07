import React, {useEffect, useState} from "react";
import {Autocomplete} from "@mui/material";
import SearchInput from "./SearchInput";
import ResultLink from "./ResultLink";
import {
  useAugmentToWithGlobalSearchParams,
  useNavigate,
} from "../../../routing";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {GTMEvents} from "../../../dataConstants";
import {
  getAccount,
  getAccountResources,
  getTransaction,
  getBlockByHeight,
  getBlockByVersion,
  getAccountResource,
} from "../../../api";
import {sendToGTM} from "../../../api/hooks/useGoogleTagManager";
import {objectCoreResource} from "../../../constants";
import {
  isValidAccountAddress,
  isValidTxnHashOrVersion,
  isNumeric,
  truncateAddress,
} from "../../utils";
import {AccountAddress} from "@aptos-labs/ts-sdk";

export type SearchResult = {
  label: string;
  to: string | null;
};

export const NotFoundResult: SearchResult = {
  label: "No Results",
  to: null,
};

type SearchMode = "idle" | "typing" | "loading" | "results";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [state] = useGlobalState();
  const [mode, setMode] = useState<SearchMode>("idle");
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchResult | null>(
    null,
  );
  const augmentToWithGlobalSearchParams = useAugmentToWithGlobalSearchParams();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (mode !== "loading" && inputValue.trim().length > 0) {
      timer = setTimeout(() => {
        fetchData(inputValue.trim());
      }, 500);
    }

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const fetchData = async (searchText: string) => {
    setMode("loading");
    const searchPerformanceStart = GTMEvents.SEARCH_STATS + " start";
    const searchPerformanceEnd = GTMEvents.SEARCH_STATS + " end";
    window.performance.mark(searchPerformanceStart);

    const isValidAccountAddr = isValidAccountAddress(searchText);
    const isValidTxnHashOrVer = isValidTxnHashOrVersion(searchText);
    const isValidBlockHeightOrVer = isNumeric(searchText);

    const promises = [];

    if (searchText.endsWith(".petra")) searchText = searchText.concat(".apt");
    const isAnsName = searchText.endsWith(".apt");

    if (isAnsName) {
      try {
        const name = await state.sdk_v2_client?.getName({
          name: searchText,
        });

        const address = name?.registered_address ?? name?.owner_address;

        if (!name || !address) {
          throw new Error("Name not found");
        }

        promises.push({
          label: `Account ${truncateAddress(address)} ${searchText}`,
          to: `/account/${address}`,
        });
      } catch (e) {}
    } else {
      if (isValidAccountAddr) {
        // TODO: Add digital assets
        // Fix the address to be correct
        const address = AccountAddress.from(searchText).toStringLong();
        // It's either an account OR an object: we query both at once to save time
        const accountPromise = getAccount({address}, state.aptos_client)
          .then((): SearchResult => {
            return {
              label: `Account ${searchText}`,
              to: `/account/${searchText}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid account
          });

        const resourcePromise = getAccountResource(
          {address, resourceType: objectCoreResource},
          state.aptos_client,
        ).then(
          () => {
            return {
              label: `Object ${searchText}`,
              to: `/object/${searchText}`,
            };
          },
          () => {
            // It's not an object
            return null;
          },
        );
        const anyResourcePromise = getAccountResources(
          {address},
          state.aptos_client,
        ).then(
          () => {
            return {
              label: `Deleted Object ${searchText}`,
              to: `/object/${searchText}`,
            };
          },
          () => {
            // It has no resources
            return null;
          },
        );
        const anyObjectsPromise = state.sdk_v2_client
          ?.getAccountOwnedObjects({accountAddress: address})
          .then(
            () => {
              return {
                label: `Address ${searchText}`,
                to: `/account/${searchText}`,
              };
            },
            () => {
              // It has no coins
              return null;
            },
          );
        promises.push(accountPromise);
        promises.push(resourcePromise);
        promises.push(anyResourcePromise);
        promises.push(anyObjectsPromise);
      }

      if (isValidTxnHashOrVer) {
        const txnPromise = getTransaction(
          {txnHashOrVersion: searchText},
          state.aptos_client,
        )
          .then((): SearchResult => {
            return {
              label: `Transaction ${searchText}`,
              to: `/txn/${searchText}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid transaction
          });
        promises.push(txnPromise);
      }

      if (isValidBlockHeightOrVer) {
        const blockByHeightPromise = getBlockByHeight(
          {height: parseInt(searchText), withTransactions: false},
          state.aptos_client,
        )
          .then((): SearchResult => {
            return {
              label: `Block ${searchText}`,
              to: `/block/${searchText}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid transaction
          });

        const blockByVersionPromise = getBlockByVersion(
          {version: parseInt(searchText), withTransactions: false},
          state.aptos_client,
        )
          .then((block): SearchResult => {
            return {
              label: `Block with Txn Version ${searchText}`,
              to: `/block/${block.block_height}`,
            };
          })
          .catch(() => {
            return null;
            // Do nothing. It's expected that not all search input is a valid transaction
          });
        promises.push(blockByHeightPromise);
        promises.push(blockByVersionPromise);
      }
    }

    const resultsList = await Promise.all(promises);
    const isAccount = resultsList.find((result) =>
      result?.label?.startsWith("Account"),
    );
    const isObject = resultsList.find((result) =>
      result?.label?.startsWith("Object"),
    );
    const isPossiblyDeletedObject = resultsList.find((result) =>
      result?.label?.startsWith("Deleted Object"),
    );
    const isPossiblyAddress = resultsList.find((result) =>
      result?.label?.startsWith("Address"),
    );

    let filteredResults: any[] = [];
    let result: any;
    if (isAccount) {
      const result = resultsList.find((result) =>
        result?.label?.startsWith("Account"),
      );
      filteredResults = [result];
    } else if (isObject) {
      const result = resultsList.find((result) =>
        result?.label?.startsWith("Object"),
      );
      filteredResults = [result];
    } else if (isPossiblyDeletedObject) {
      const result = resultsList.find((result) =>
        result?.label?.startsWith("Deleted Object"),
      );
      filteredResults = [result];
    } else if (isPossiblyAddress) {
      const result = resultsList.find((result) =>
        result?.label?.startsWith("Address"),
      );
      filteredResults = [result];
    } else {
      filteredResults = resultsList;
    }
    if (filteredResults === undefined || filteredResults === null) {
      filteredResults = result ? [] : resultsList;
    }
    console.log(`FILTERED AGAIN: ${JSON.stringify(filteredResults)}`);
    const results = filteredResults
      .filter((result) => result !== null)
      .filter((result): result is SearchResult => !!result)
      .map((result) => {
        if (result.to) {
          return {...result, to: augmentToWithGlobalSearchParams(result.to)};
        }

        return result;
      });

    window.performance.mark(searchPerformanceEnd);
    sendToGTM({
      dataLayer: {
        event: GTMEvents.SEARCH_STATS,
        network: state.network_name,
        searchText: searchText,
        searchResult: results.length === 0 ? "notFound" : "success",
        duration: window.performance.measure(
          GTMEvents.SEARCH_STATS,
          searchPerformanceStart,
          searchPerformanceEnd,
        ).duration,
      },
    });

    if (results.length === 0) {
      results.push(NotFoundResult);
    }

    setOptions(results);
    setMode("idle");
    setOpen(true);
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
      getOptionLabel={() => ""}
      filterOptions={(x) => x.filter((x) => !!x)}
      options={options}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        setOpen(false);
        if (event && event.type === "blur") {
          setInputValue("");
        } else if (reason !== "reset") {
          setMode(newInputValue.trim().length === 0 ? "idle" : "typing");
          setInputValue(newInputValue);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          const selected = selectedOption?.to ?? options[0]?.to;
          if (selected) {
            navigate(selected);
          }
          event.preventDefault();
        }
      }}
      onClose={() => setOpen(false)}
      renderInput={(params) => {
        return (
          <SearchInput
            {...params}
            loading={mode === "loading" || mode === "typing"}
          />
        );
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
    />
  );
}
