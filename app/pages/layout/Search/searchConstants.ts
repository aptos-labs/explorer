import {en} from "../../../i18n/messages/en";

/**
 * Shared tokens for the explorer's search UI.
 *
 * Both search surfaces — the per-page header autocomplete
 * (`app/pages/layout/Search/Index.tsx`) and the home-page inline search
 * (`app/pages/Search/SearchWithResults.tsx`) — import these so their
 * placeholder, helper text, debounce timing, font size, and icon color stay in
 * lockstep instead of drifting apart in each component.
 */

/** Placeholder shown in every search input. English source lives in the i18n catalog. */
export const SEARCH_PLACEHOLDER = en.search.placeholder;

/** Helper text describing what can be searched. */
export const SEARCH_HELPER_TEXT = en.search.helper;

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

/** i18n key for a search-result type chip. */
export function searchResultTypeMessageKey(type?: string): string {
  switch (type) {
    case "account":
      return "search.type.account";
    case "address":
      return "search.type.address";
    case "transaction":
      return "search.type.transaction";
    case "block":
      return "search.type.block";
    case "coin":
      return "search.type.coin";
    case "fungible-asset":
      return "search.type.fungibleAsset";
    case "object":
      return "search.type.object";
    default:
      return "search.type.result";
  }
}

/** Human-readable label for a search-result type, shown in the row's chip. */
export function searchResultTypeLabel(type?: string): string {
  switch (type) {
    case "account":
      return en.search.type.account;
    case "address":
      return en.search.type.address;
    case "transaction":
      return en.search.type.transaction;
    case "block":
      return en.search.type.block;
    case "coin":
      return en.search.type.coin;
    case "fungible-asset":
      return en.search.type.fungibleAsset;
    case "object":
      return en.search.type.object;
    default:
      return en.search.type.result;
  }
}
