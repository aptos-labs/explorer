/**
 * Shared tokens for the explorer's search UI.
 *
 * Both search surfaces — the per-page header autocomplete
 * (`app/pages/layout/Search/Index.tsx`) and the home-page inline search
 * (`app/pages/Search/SearchWithResults.tsx`) — import these so their
 * placeholder, helper text, debounce timing, font size, and icon color stay in
 * lockstep instead of drifting apart in each component.
 */

/** Placeholder shown in every search input. */
export const SEARCH_PLACEHOLDER =
  "Search by address, txn, block, coin, or ANS name";

/** Helper text describing what can be searched. */
export const SEARCH_HELPER_TEXT =
  "Account address or name · Txn hash or version · Block height · Coin type · ANS name";

/** Debounce (ms) between the last keystroke and firing a search. */
export const SEARCH_DEBOUNCE_MS = 400;

/** Font size for the search input text. */
export const SEARCH_INPUT_FONT_SIZE = "1.1rem";

/** MUI color token for the search start-adornment icon. */
export const SEARCH_ICON_COLOR = "action" as const;

export type SearchChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

/** Map a search-result type to the MUI chip color used in result rows. */
export function searchResultTypeChipColor(type?: string): SearchChipColor {
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

/** Human-readable label for a search-result type, shown in the row's chip. */
export function searchResultTypeLabel(type?: string): string {
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
