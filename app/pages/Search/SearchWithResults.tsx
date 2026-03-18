/**
 * SearchWithResults — self-contained search input + inline result list.
 *
 * Used in two contexts:
 *  - Landing page (/): updateUrl=false, onResultsChange to toggle surrounding content
 *  - Search page (/search): updateUrl=true so the URL reflects the current query
 */

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
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
import {
  Link,
  useAugmentToWithGlobalSearchParams,
  useNavigate,
} from "../../routing";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from "../../utils/cacheManager";
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

// ─── Type chip helpers ────────────────────────────────────────────────────────

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

function typeChipColor(type?: string): ChipColor {
  switch (type) {
    case "account":
    case "address":
      return "primary";
    case "transaction":
      return "success";
    case "block":
      return "info";
    case "coin":
    case "fungible-asset":
      return "warning";
    case "object":
      return "secondary";
    default:
      return "default";
  }
}

function typeLabel(type?: string): string {
  switch (type) {
    case "account":
      return "Account";
    case "address":
      return "Address";
    case "transaction":
      return "Transaction";
    case "block":
      return "Block";
    case "coin":
      return "Coin";
    case "fungible-asset":
      return "Fungible Asset";
    case "object":
      return "Object";
    default:
      return "Result";
  }
}

// ─── Individual result row ────────────────────────────────────────────────────

function SearchResultRow({result}: {result: SearchResult}) {
  if (result.isGroupHeader) {
    return (
      <Box sx={{px: 2, py: 1, bgcolor: "action.hover"}}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "text.secondary",
            fontSize: "0.7rem",
          }}
        >
          {result.label}
        </Typography>
      </Box>
    );
  }

  if (!result.to) {
    return (
      <Box sx={{px: 2, py: 2}}>
        <Typography color="text.secondary">{result.label}</Typography>
      </Box>
    );
  }

  return (
    <Link
      to={result.to}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        color: "text.primary",
        textDecoration: "none",
        transition: "background-color 0.15s",
        "&:hover": {
          bgcolor: "action.hover",
          opacity: 1,
        },
      }}
    >
      {result.image ? (
        <Box
          component="img"
          src={result.image}
          alt=""
          sx={{width: 24, height: 24, borderRadius: "50%", flexShrink: 0}}
        />
      ) : null}
      <Chip
        label={typeLabel(result.type)}
        color={typeChipColor(result.type)}
        size="small"
        sx={{flexShrink: 0, fontWeight: 600, fontSize: "0.7rem"}}
      />
      <Typography
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.9rem",
        }}
      >
        {result.label}
      </Typography>
      <ArrowForwardIosIcon
        sx={{flexShrink: 0, fontSize: "0.85rem", color: "text.disabled"}}
      />
    </Link>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SearchWithResultsProps {
  /** Pre-populate the search box and fire an immediate search. */
  initialQuery?: string;
  /**
   * When true the URL is updated to `/search?q=<query>` as the user types
   * (using history replace so the back button is not polluted).
   * Set to false on the landing page so the URL stays at `/`.
   */
  updateUrl?: boolean;
  /**
   * Called whenever the result state changes so the parent can conditionally
   * render surrounding content.  `true` = at least one result row is visible.
   */
  onResultsChange?: (hasResults: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchWithResults({
  initialQuery,
  updateUrl = true,
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

  // Notify parent whenever visible result state changes
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

  // Debounce: optionally update URL, then fire search
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
      if (updateUrl) {
        navigate({to: "/search", search: {q: query.trim()}, replace: true});
      }
      runSearch(query.trim(), controller.signal);
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, navigate, runSearch, updateUrl]);

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
        placeholder="Address, transaction hash, version, block height, ANS name, coin type…"
        aria-label="Search the Aptos Explorer"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment:
              status === "loading" ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : undefined,
            sx: {fontSize: "1.05rem"},
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
              <Typography color="text.secondary">
                No results for{" "}
                <Box component="span" sx={{fontWeight: 600}}>
                  "{query}"
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                Try an account address, transaction hash or version, block
                height, ANS name, or coin type.
              </Typography>
            </Box>
          ) : (
            results.map((result, idx) => (
              <Box key={result.to ?? `header-${result.label}`}>
                <SearchResultRow result={result} />
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
