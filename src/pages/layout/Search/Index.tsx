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
import {faMetadataResource, objectCoreResource} from "../../../constants";
import {
  isValidAccountAddress,
  isNumeric,
  truncateAddress,
  is32ByteHex,
  isValidStruct,
} from "../../utils";
import {AccountAddress} from "@aptos-labs/ts-sdk";
import {
  CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import {getAssetSymbol} from "../../../utils";
import {knownAddresses} from "../../../api/hooks/useGetANS";

export type SearchResult = {
  label: string;
  to: string | null;
  image?: string;
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

  const coinList = useGetCoinList();

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

  async function handleAnsName(
    searchText: string,
  ): Promise<SearchResult | null> {
    return state.sdk_v2_client
      .getName({
        name: searchText,
      })
      .then((ansName) => {
        const address = ansName?.registered_address ?? ansName?.owner_address;

        if (ansName && address) {
          return {
            label: `Account ${truncateAddress(address)} ${searchText}`,
            to: `/account/${address}`,
          };
        }
        return null;
      })
      .catch(() => {
        return null;
      });
  }

  async function handleCoin(searchText: string): Promise<SearchResult | null> {
    const address = searchText.split("::")[0];
    return getAccountResource(
      {address, resourceType: `0x1::coin::CoinInfo<${searchText}>`},
      state.aptos_client,
    )
      .then(() => {
        return {
          label: `Coin ${searchText}`,
          to: `/coin/${searchText}`,
        };
      })
      .catch(() => {
        return null;
      });
  }

  function handleBlockHeightOrVersion(
    searchText: string,
  ): Promise<SearchResult | null>[] {
    const num = parseInt(searchText);
    const promises = [];
    const blockByHeightPromise = getBlockByHeight(
      {height: num, withTransactions: false},
      state.aptos_client,
    )
      .then((): SearchResult => {
        return {
          label: `Block ${num}`,
          to: `/block/${num}`,
        };
      })
      .catch(() => {
        return null;
        // Do nothing. It's expected that not all search input is a valid transaction
      });

    const blockByVersionPromise = getBlockByVersion(
      {version: num, withTransactions: false},
      state.aptos_client,
    )
      .then((block): SearchResult => {
        return {
          label: `Block with Txn Version ${num}`,
          to: `/block/${block.block_height}`,
        };
      })
      .catch(() => {
        return null;
        // Do nothing. It's expected that not all search input is a valid transaction
      });
    const transactionByVersion = getTransaction(
      {txnHashOrVersion: num},
      state.aptos_client,
    )
      .then((): SearchResult => {
        return {
          label: `Transaction Version ${num}`,
          to: `/txn/${num}`,
        };
      })
      .catch(() => {
        return null;
        // Do nothing. It's expected that not all search input is a valid transaction
      });
    promises.push(transactionByVersion);
    promises.push(blockByHeightPromise);
    promises.push(blockByVersionPromise);
    return promises;
  }

  async function handleTransaction(
    searchText: string,
  ): Promise<SearchResult | null> {
    return getTransaction({txnHashOrVersion: searchText}, state.aptos_client)
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
  }

  function handleAddress(searchText: string): Promise<SearchResult | null>[] {
    // TODO: add digital assets, collections, etc.
    const promises = [];
    const address = AccountAddress.from(searchText).toStringLong();
    // It's either an account OR an object: we query both at once to save time
    const accountPromise = getAccount({address}, state.aptos_client)
      .then((): SearchResult => {
        return {
          label: `Account ${address}`,
          to: `/account/${address}`,
        };
      })
      .catch(() => {
        return null;
        // Do nothing. It's expected that not all search input is a valid account
      });
    // TODO: Add searching the coin list first
    const faPromise = getAccountResource(
      {address, resourceType: faMetadataResource},
      state.aptos_client,
    ).then(
      () => {
        return {
          label: `Fungible Asset ${address}`,
          to: `/fungible_asset/${address}`,
        };
      },
      () => {
        // It's not a fa
        return null;
      },
    );
    const resourcePromise = getAccountResource(
      {address, resourceType: objectCoreResource},
      state.aptos_client,
    ).then(
      () => {
        return {
          label: `Object ${address}`,
          to: `/object/${address}`,
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
          label: `Deleted Object ${address}`,
          to: `/object/${address}`,
        };
      },
      () => {
        // It has no resources
        return null;
      },
    );
    const anyObjectsPromise = state.sdk_v2_client
      .getAccountOwnedObjects({accountAddress: address})
      .then(
        () => {
          return {
            label: `Address ${address}`,
            to: `/account/${address}`,
          };
        },
        () => {
          // It has no coins
          return null;
        },
      );
    promises.push(faPromise);
    promises.push(accountPromise);
    promises.push(resourcePromise);
    promises.push(anyResourcePromise);
    promises.push(anyObjectsPromise);
    return promises;
  }

  async function handleLabelLookup(
    searchText: string,
  ): Promise<(SearchResult | null)[]> {
    const searchResults: SearchResult[] = [];
    const searchLowerCase = searchText.toLowerCase();
    Object.entries(knownAddresses).forEach(([address, knownName]) => {
      if (
        (searchLowerCase.length >= 4 &&
          knownName.toLowerCase().startsWith(searchLowerCase)) ||
        (searchLowerCase.length < 4 &&
          knownName.toLowerCase() === searchLowerCase)
      ) {
        searchResults.push({
          label: `Account ${truncateAddress(address)} ${knownName}`,
          to: `/account/${address}`,
        });
      }
    });
    return searchResults;
  }

  async function handleCoinLookup(
    searchText: string,
  ): Promise<(SearchResult | null)[]> {
    const searchLowerCase = searchText.toLowerCase();
    const coinData = coinList?.data?.data
      ?.filter(
        (coin: CoinDescription) =>
          coin.symbol?.toLowerCase() === searchLowerCase ||
          coin.panoraSymbol?.toLowerCase() === searchLowerCase ||
          coin.name?.toLowerCase() === searchLowerCase,
      )
      .map((coin: CoinDescription) => {
        if (coin.tokenAddress) {
          return {
            label: `${getAssetSymbol(coin.panoraSymbol, coin.bridge, coin.symbol)}`,
            to: `/coin/${coin.tokenAddress}`,
            image: coin.logoUrl,
          };
        } else {
          return {
            label: `${getAssetSymbol(coin.panoraSymbol, coin.bridge, coin.symbol)}`,
            to: `/fungible_asset/${coin.faAddress}`,
            image: coin.logoUrl,
          };
        }
      });

    return coinData ?? [];
  }

  const fetchData = async (searchText: string) => {
    setMode("loading");
    const searchPerformanceStart = GTMEvents.SEARCH_STATS + " start";
    const searchPerformanceEnd = GTMEvents.SEARCH_STATS + " end";
    window.performance.mark(searchPerformanceStart);

    const isValidAccountAddr = isValidAccountAddress(searchText);
    const isValidBlockHeightOrVer = isNumeric(searchText);
    const is32Hex = is32ByteHex(searchText);
    const isStruct = isValidStruct(searchText);
    if (searchText.endsWith(".petra")) searchText = searchText.concat(".apt");
    const isAnsName = searchText.endsWith(".apt");
    const promises = [];
    const multipleSearchPromises = [];

    if (isAnsName) {
      promises.push(handleAnsName(searchText));
    } else if (isStruct) {
      multipleSearchPromises.push(handleCoinLookup(searchText));
      promises.push(handleCoin(searchText));
    } else if (isValidBlockHeightOrVer) {
      // These are block heights AND versions
      promises.push(...handleBlockHeightOrVersion(searchText));
    } else if (is32Hex) {
      // These are transaction hashes AND addresses
      promises.push(handleTransaction(searchText));
      promises.push(...handleAddress(searchText));
    } else if (isValidAccountAddr) {
      // These are only addresses
      promises.push(...handleAddress(searchText));
    } else if (searchText.length > 2) {
      multipleSearchPromises.push(handleCoinLookup(searchText));
      multipleSearchPromises.push(handleLabelLookup(searchText));
    }
    const resultsList: (SearchResult | null)[] = [];
    if (multipleSearchPromises) {
      const results = await Promise.all(multipleSearchPromises);
      resultsList.push(...results?.flat()?.filter((r) => r !== null));
    }
    if (promises) {
      const results = await Promise.all(promises);
      resultsList.push(...results);
    }

    const foundAccount = resultsList.find((r) =>
      r?.label?.startsWith("Account"),
    );
    const foundFa = resultsList.find((r) =>
      r?.label?.startsWith("Fungible Asset"),
    );
    const foundObject = resultsList.find((r) => r?.label?.startsWith("Object"));
    const foundDeletedObject = resultsList.find((r) =>
      r?.label?.startsWith("Deleted Object"),
    );
    const foundPossibleAddress = resultsList.find((r) =>
      r?.label?.startsWith("Address"),
    );
    const foundCoinByList = resultsList.find(
      (r) => r?.label?.startsWith("Coin") && !r?.label?.startsWith("Coin 0x"),
    );
    const foundCoinByStruct = resultsList.find((r) =>
      r?.label?.startsWith("Coin 0x"),
    );

    // Something besides any
    let filteredResults: any[];

    switch (true) {
      case Boolean(foundCoinByList): {
        filteredResults = resultsList.filter((r) => r !== foundCoinByStruct);
        break;
      }
      case Boolean(foundFa): {
        filteredResults = resultsList.filter(
          (r) => r !== foundPossibleAddress && r !== foundDeletedObject,
        );
        break;
      }
      case Boolean(foundAccount): {
        filteredResults = resultsList.filter(
          (r) => r !== foundPossibleAddress && r !== foundDeletedObject,
        );
        break;
      }
      case Boolean(foundObject): {
        filteredResults = resultsList.filter(
          (r) => r !== foundPossibleAddress && r !== foundDeletedObject,
        );
        break;
      }
      case Boolean(foundDeletedObject): {
        filteredResults = resultsList.filter((r) => r !== foundPossibleAddress);
        break;
      }
      default: {
        filteredResults = resultsList;
      }
    }
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
            <ResultLink
              to={option.to}
              text={option.label}
              image={option.image}
            />
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
