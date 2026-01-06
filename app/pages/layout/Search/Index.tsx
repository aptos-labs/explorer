import React, {useEffect, useState, useRef} from "react";
import {Autocomplete, Typography} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import SearchInput from "./SearchInput";
import ResultLink from "./ResultLink";
import {
  useAugmentToWithGlobalSearchParams,
  useNavigate,
} from "../../../routing";
import {
  useNetworkName,
  useNetworkValue,
  useSdkV2Client,
} from "../../../global-config/GlobalConfig";
import {GTMEvents} from "../../../dataConstants";
import {sendToGTM} from "../../../api/hooks/useGoogleTagManager";
import {useGetCoinList} from "../../../api/hooks/useGetCoinList";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from "../../../utils/cacheManager";
import {
  SearchResult,
  NotFoundResult,
  detectInputType,
  normalizeSearchInput,
  getSearchCacheKey,
  isDefinitiveResult,
  handleAnsName,
  handleCoin,
  handleBlockHeightOrVersion,
  handleTransaction,
  handleAddress,
  anyOwnedObjects,
  handleLabelLookup,
  handleCoinLookup,
  handleEmojiCoinLookup,
  filterSearchResults,
  groupSearchResults,
} from "./searchUtils";

// Re-export for backward compatibility
export type {SearchResult};
export {NotFoundResult};

type SearchMode = "idle" | "typing" | "loading" | "results";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const networkName = useNetworkName();
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<SearchMode>("idle");
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchResult | null>(
    null,
  );
  const augmentToWithGlobalSearchParams = useAugmentToWithGlobalSearchParams();

  const coinList = useGetCoinList();
  const abortControllerRef = useRef<AbortController | null>(null);
  const inFlightRequestsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Abort previous request when input changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let timer: number;

    if (mode !== "loading" && inputValue.trim().length > 0) {
      timer = setTimeout(() => {
        fetchData(inputValue.trim(), abortController.signal);
      }, 500) as unknown as number; // Debounce set to 500ms to balance responsiveness and API efficiency
    }

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const fetchData = async (searchText: string, signal: AbortSignal) => {
    if (signal.aborted) return;

    // Check cache first
    const normalizedInput = normalizeSearchInput(searchText);
    const cacheKey = getSearchCacheKey(networkName, normalizedInput);
    const cachedResults = getLocalStorageWithExpiry<SearchResult[]>(cacheKey);

    if (cachedResults && cachedResults.length > 0) {
      // Apply grouping to cached results as well
      const groupedCachedResults = groupSearchResults(cachedResults);
      const results = groupedCachedResults.map((result) => {
        if (result.to) {
          return {...result, to: augmentToWithGlobalSearchParams(result.to)};
        }
        return result;
      });
      setOptions(results);
      setMode("idle");
      setOpen(true);
      return;
    }

    // Check for duplicate in-flight requests
    if (inFlightRequestsRef.current.has(normalizedInput)) {
      return;
    }
    inFlightRequestsRef.current.add(normalizedInput);

    setMode("loading");
    const searchPerformanceStart = GTMEvents.SEARCH_STATS + " start";
    window.performance.mark(searchPerformanceStart);

    try {
      // Normalize search text
      let normalizedSearchText = searchText;
      if (normalizedSearchText.endsWith(".petra")) {
        normalizedSearchText = normalizedSearchText + ".apt";
      }

      // Detect input type for optimized query strategy
      const inputType = detectInputType(normalizedSearchText);
      const resultsList: (SearchResult | null)[] = [];

      // Priority-based query execution
      if (inputType.isAnsName) {
        // ANS name lookup
        const result = await handleAnsName(
          normalizedSearchText,
          sdkV2Client,
          signal,
        );
        if (signal.aborted) return;
        if (result) {
          resultsList.push(result);
          // ANS names are definitive, can early exit
          if (isDefinitiveResult(result)) {
            const finalResults = filterSearchResults(resultsList);
            const groupedResults = groupSearchResults(finalResults);
            await finalizeResults(
              groupedResults,
              normalizedSearchText,
              cacheKey,
            );
            return;
          }
        }
      } else if (inputType.isStruct) {
        // Struct type (coin)
        const coinResults = handleCoinLookup(
          normalizedSearchText,
          coinList?.data?.data,
        );
        resultsList.push(...coinResults);
        const coinResult = await handleCoin(
          normalizedSearchText,
          sdkV2Client,
          signal,
        );
        if (signal.aborted) return;
        if (coinResult) {
          resultsList.push(coinResult);
        }
      } else if (inputType.isValidBlockHeightOrVer) {
        // Block height or version
        const blockResults = await handleBlockHeightOrVersion(
          normalizedSearchText,
          sdkV2Client,
          signal,
        );
        if (signal.aborted) return;
        resultsList.push(...blockResults);
        // Check for early termination
        const definitiveResult = resultsList.find(isDefinitiveResult);
        if (definitiveResult) {
          const finalResults = filterSearchResults(resultsList);
          const groupedResults = groupSearchResults(finalResults);
          await finalizeResults(groupedResults, normalizedSearchText, cacheKey);
          return;
        }
      } else if (inputType.is32Hex) {
        // 32-byte hex (transaction hash or address)
        // Try transaction first (fastest)
        const txnResult = await handleTransaction(
          normalizedSearchText,
          sdkV2Client,
          signal,
        );
        if (signal.aborted) return;
        if (txnResult) {
          resultsList.push(txnResult);
        }

        // Try address lookup
        const addressResults = await handleAddress(
          normalizedSearchText,
          sdkV2Client,
          queryClient,
          networkValue,
          signal,
        );
        if (signal.aborted) return;
        resultsList.push(...addressResults);

        // Coin lookup (fast, no API call)
        const coinResults = handleCoinLookup(
          normalizedSearchText,
          coinList?.data?.data,
        );
        resultsList.push(...coinResults);
      } else if (inputType.isValidAccountAddr) {
        // Valid account address
        const addressResults = await handleAddress(
          normalizedSearchText,
          sdkV2Client,
          queryClient,
          networkValue,
          signal,
        );
        if (signal.aborted) return;
        resultsList.push(...addressResults);

        // Coin lookup
        const coinResults = handleCoinLookup(
          normalizedSearchText,
          coinList?.data?.data,
        );
        resultsList.push(...coinResults);
      } else if (inputType.isEmoji) {
        // Emoji coin lookup
        const emojiResults = await handleEmojiCoinLookup(
          normalizedSearchText,
          sdkV2Client,
          signal,
        );
        if (signal.aborted) return;
        resultsList.push(...emojiResults);
      } else if (inputType.isGeneric) {
        // Generic search - try fast lookups first
        const coinResults = handleCoinLookup(
          normalizedSearchText,
          coinList?.data?.data,
        );
        resultsList.push(...coinResults);

        const labelResults = handleLabelLookup(normalizedSearchText);
        resultsList.push(...labelResults);
      }

      // Filter and deduplicate results
      let filteredResults = filterSearchResults(resultsList);

      // Fallback: slow query only if no results found
      if (filteredResults.length === 0) {
        if (inputType.is32Hex || inputType.isValidAccountAddr) {
          const fallbackResult = await anyOwnedObjects(
            normalizedSearchText,
            sdkV2Client,
            signal,
          );
          if (signal.aborted) return;
          if (fallbackResult) {
            filteredResults = [...filteredResults, fallbackResult];
          }
        }
      }

      // Group results by asset type
      const groupedResults = groupSearchResults(filteredResults);

      await finalizeResults(groupedResults, normalizedSearchText, cacheKey);
    } catch (error) {
      if (signal.aborted) return;
      console.error("Search error:", error);
      setOptions([NotFoundResult]);
      setMode("idle");
      setOpen(true);
    } finally {
      inFlightRequestsRef.current.delete(normalizedInput);
    }
  };

  const finalizeResults = async (
    filteredResults: SearchResult[],
    searchText: string,
    cacheKey: string,
  ) => {
    const results = filteredResults.map((result) => {
      if (result.to) {
        return {...result, to: augmentToWithGlobalSearchParams(result.to)};
      }
      return result;
    });

    // Cache results
    const hasTransactionsOrBlocks = results.some(
      (r) => r.label.startsWith("Transaction") || r.label.startsWith("Block"),
    );
    // We cache pure transaction/block result sets longer than everything else.
    // Mixed result sets (e.g. transactions + accounts) and non-transaction results
    // use the shorter TTL to avoid stale, frequently-changing data.
    const hasOnlyTransactionsOrBlocks =
      hasTransactionsOrBlocks &&
      results.every(
        (r) => r.label.startsWith("Transaction") || r.label.startsWith("Block"),
      );

    const cacheTTL = hasOnlyTransactionsOrBlocks
      ? 60 * 60 * 1000 // 1 hour for pure transaction/block results
      : 5 * 60 * 1000; // 5 minutes for accounts/addresses/coins or mixed results
    setLocalStorageWithExpiry(cacheKey, results, cacheTTL);

    // Performance tracking
    const searchPerformanceStart = GTMEvents.SEARCH_STATS + " start";
    const searchPerformanceEnd = GTMEvents.SEARCH_STATS + " end";
    window.performance.mark(searchPerformanceEnd);
    sendToGTM({
      dataLayer: {
        event: GTMEvents.SEARCH_STATS,
        network: networkName,
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
          fontFamily:
            '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
      clearOnBlur
      autoSelect={false}
      getOptionLabel={() => ""}
      filterOptions={(x) => x.filter((x) => !!x)}
      getOptionDisabled={(option) => option.isGroupHeader === true}
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
          // Skip group headers when navigating
          const selectableOption = options.find(
            (opt) => opt.to && !opt.isGroupHeader,
          );
          const selected = selectedOption?.to ?? selectableOption?.to;
          if (selected) {
            navigate({to: selected});
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
        if (option.isGroupHeader) {
          // Don't spread props for group headers - render as non-interactive divider
          return (
            <li
              key={props.id}
              role="presentation"
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                cursor: "default",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  px: 2,
                  py: 0.75,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                  backgroundColor: "action.hover",
                }}
              >
                {option.label}
              </Typography>
            </li>
          );
        }
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
