/**
 * SearchWithResults — self-contained search input + inline result list.
 *
 * Used on the landing page (/): seeds from the `?search=` URL parameter and
 * calls `onResultsChange` so the page can hide its CTAs while results show.
 *
 * Shares its input tokens (placeholder, helper text, debounce, font, icon
 * color) and its result-row / group-header presentation with the per-page
 * header autocomplete (`app/pages/layout/Search/Index.tsx`) so the two search
 * surfaces stay visually consistent.
 */

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useCallback, useEffect, useRef, useState} from "react";
import {useGetCoinList} from "../../api/hooks/useGetCoinList";
import {
  useNetworkName,
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config/GlobalConfig";
import {useAugmentToWithGlobalSearchParams, useNavigate} from "../../routing";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from "../../utils/cacheManager";
import {
  SearchResultGroupHeader,
  SearchResultRow,
} from "../layout/Search/SearchResultRow";
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_HELPER_TEXT,
  SEARCH_ICON_COLOR,
  SEARCH_INPUT_FONT_SIZE,
  SEARCH_PLACEHOLDER,
} from "../layout/Search/searchConstants";
import {
  anyOwnedObjects,
  createFallbackAddressResult,
  detectInputType,
  filterSearchResults,
  getSearchCacheKey,
  groupSearchResults,
  handleAddress,
  handleAnsName,
  handleBlockHeightOrVersion,
  handleCoin,
  handleCoinLookup,
  handleEmojiCoinLookup,
  handleLabelLookup,
  handleTransaction,
  NotFoundResult,
  normalizeSearchInput,
  type SearchResult,
} from "../layout/Search/searchUtils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SearchWithResultsProps {
  /** Pre-populate the search box and fire an immediate search. */
  initialQuery?: string;
  /**
   * Called when the visible result state changes.
   * `true` = results (or a "no results" message) are displayed.
   * Lets the parent conditionally show/hide surrounding content.
   */
  onResultsChange?: (hasResults: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchWithResults({
  initialQuery,
  onResultsChange,
}: SearchWithResultsProps) {
  const navigate = useNavigate();
  const networkName = useNetworkName();
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  const queryClient = useQueryClient();
  const coinList = useGetCoinList();
  const augmentToWithGlobalSearchParams = useAugmentToWithGlobalSearchParams();

  const [query, setQuery] = useState(initialQuery ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef<Set<string>>(new Set());
  const initialQueryRef = useRef(initialQuery);

  const hasResults =
    results.length > 0 &&
    !(results.length === 1 && results[0] === NotFoundResult);
  const isEmpty =
    status === "done" && results.length === 1 && results[0] === NotFoundResult;

  useEffect(() => {
    onResultsChange?.(hasResults || isEmpty);
  }, [hasResults, isEmpty, onResultsChange]);

  // Seed from initialQuery on mount
  useEffect(() => {
    const value = initialQueryRef.current?.trim();
    if (value) {
      setStatus("loading");
      setQuery(value);
    }
  }, []);

  const runSearch = useCallback(
    async (searchText: string, signal: AbortSignal) => {
      if (signal.aborted || !searchText.trim()) return;

      const normalizedInput = normalizeSearchInput(searchText);
      const cacheKey = getSearchCacheKey(networkName, normalizedInput);

      const cached = getLocalStorageWithExpiry<SearchResult[]>(cacheKey);
      if (cached && cached.length > 0) {
        const augmented = cached.map((r) =>
          r.to ? {...r, to: augmentToWithGlobalSearchParams(r.to)} : r,
        );
        setResults(augmented);
        setStatus("done");
        return;
      }

      if (inFlightRef.current.has(normalizedInput)) return;
      inFlightRef.current.add(normalizedInput);
      setStatus("loading");

      try {
        let normalized = searchText;
        if (normalized.endsWith(".petra")) normalized = `${normalized}.apt`;

        const inputType = detectInputType(normalized);
        const resultsList: (SearchResult | null)[] = [];

        if (inputType.isAnsName) {
          const r = await handleAnsName(normalized, sdkV2Client, signal);
          if (signal.aborted) return;
          if (r) resultsList.push(r);
        } else if (inputType.isStruct) {
          resultsList.push(
            ...handleCoinLookup(normalized, coinList?.data?.data),
          );
          const r = await handleCoin(normalized, sdkV2Client, signal);
          if (signal.aborted) return;
          if (r) resultsList.push(r);
        } else if (inputType.isValidBlockHeightOrVer) {
          const blockResults = await handleBlockHeightOrVersion(
            normalized,
            sdkV2Client,
            signal,
          );
          if (signal.aborted) return;
          resultsList.push(...blockResults);
        } else if (inputType.is32Hex) {
          const [txnResult, addressResults] = await Promise.all([
            handleTransaction(normalized, sdkV2Client, signal),
            handleAddress(
              normalized,
              sdkV2Client,
              queryClient,
              networkValue,
              signal,
            ),
          ]);
          if (signal.aborted) return;
          if (txnResult) resultsList.push(txnResult);
          resultsList.push(...addressResults);
          resultsList.push(
            ...handleCoinLookup(normalized, coinList?.data?.data),
          );
        } else if (inputType.isValidAccountAddr) {
          const addressResults = await handleAddress(
            normalized,
            sdkV2Client,
            queryClient,
            networkValue,
            signal,
          );
          if (signal.aborted) return;
          resultsList.push(...addressResults);
          resultsList.push(
            ...handleCoinLookup(normalized, coinList?.data?.data),
          );
        } else if (inputType.isEmoji) {
          const emojiResults = await handleEmojiCoinLookup(
            normalized,
            sdkV2Client,
            signal,
          );
          if (signal.aborted) return;
          resultsList.push(...emojiResults);
        } else if (inputType.isGeneric) {
          resultsList.push(
            ...handleCoinLookup(normalized, coinList?.data?.data),
          );
          resultsList.push(...handleLabelLookup(normalized, networkName));
        }

        let filtered = filterSearchResults(resultsList);

        if (
          filtered.length === 0 &&
          (inputType.is32Hex || inputType.isValidAccountAddr)
        ) {
          const fallback = await anyOwnedObjects(
            normalized,
            sdkV2Client,
            signal,
          );
          if (signal.aborted) return;
          if (fallback) filtered = [fallback];
        }

        if (
          filtered.length === 0 &&
          (inputType.is32Hex || inputType.isValidAccountAddr)
        ) {
          const fallback = createFallbackAddressResult(normalized);
          if (fallback) filtered = [fallback];
        }

        const grouped = groupSearchResults(filtered);

        const ttl =
          grouped.length > 0 &&
          grouped.every(
            (r) =>
              r.label.startsWith("Transaction") || r.label.startsWith("Block"),
          )
            ? 60 * 60 * 1000
            : 5 * 60 * 1000;

        if (grouped.length > 0) {
          setLocalStorageWithExpiry(cacheKey, grouped, ttl);
        }

        const augmented = (grouped.length > 0 ? grouped : [NotFoundResult]).map(
          (r) => (r.to ? {...r, to: augmentToWithGlobalSearchParams(r.to)} : r),
        );

        setResults(augmented);
        setStatus("done");
      } catch (_err) {
        if (signal.aborted) return;
        setResults([NotFoundResult]);
        setStatus("done");
      } finally {
        inFlightRef.current.delete(normalizedInput);
      }
    },
    [
      networkName,
      networkValue,
      sdkV2Client,
      queryClient,
      coinList?.data?.data,
      augmentToWithGlobalSearchParams,
    ],
  );

  // Debounce, then fire search
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!query.trim()) {
      setResults([]);
      setStatus("idle");
      return;
    }

    const timer = setTimeout(() => {
      runSearch(query.trim(), controller.signal);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, runSearch]);

  // Enter key: navigate to first result immediately
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const first = results.find((r) => r.to && !r.isGroupHeader);
      if (first?.to) navigate({to: first.to});
    },
    [results, navigate],
  );

  return (
    <Box>
      {/* Search input */}
      <TextField
        autoFocus={!!initialQuery}
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={SEARCH_PLACEHOLDER}
        helperText={SEARCH_HELPER_TEXT}
        aria-label="Search the Aptos Explorer"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={SEARCH_ICON_COLOR} />
              </InputAdornment>
            ),
            endAdornment:
              status === "loading" ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : undefined,
            sx: {fontSize: SEARCH_INPUT_FONT_SIZE},
          },
        }}
        sx={{"& .MuiOutlinedInput-root": {borderRadius: 2}}}
      />
      {/* Inline results */}
      {(hasResults || isEmpty) && (
        <Paper
          variant="outlined"
          sx={{mt: 1, borderRadius: 2, overflow: "hidden"}}
          aria-label="Search results"
          aria-live="polite"
        >
          {isEmpty ? (
            <Box sx={{px: 2, py: 2.5, textAlign: "center"}}>
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                No results for{" "}
                <Box component="span" sx={{fontWeight: 600}}>
                  "{query}"
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                Try an account address, transaction hash or version, block
                height, ANS name, or coin type.
              </Typography>
            </Box>
          ) : (
            results.map((result, idx) => (
              <Box key={result.to ?? `header-${result.label}`}>
                {result.isGroupHeader ? (
                  <SearchResultGroupHeader label={result.label} />
                ) : (
                  <SearchResultRow result={result} showChevron />
                )}
                {idx < results.length - 1 && !result.isGroupHeader && (
                  <Divider />
                )}
              </Box>
            ))
          )}
        </Paper>
      )}
    </Box>
  );
}
