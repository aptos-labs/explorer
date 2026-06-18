import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {Box, Chip, Typography, useTheme} from "@mui/material";
import type React from "react";
import {memo} from "react";
import {Link} from "../../../routing";
import {SearchResultAvatar} from "./SearchResultAvatar";
import {
  searchResultTypeChipColor,
  searchResultTypeLabel,
} from "./searchConstants";
import type {SearchResult} from "./searchUtils";

/**
 * Section header shown above a group of search results (e.g. "ACCOUNTS").
 * Shared by the header autocomplete dropdown and the home-page inline list so
 * both render identically.
 */
export const SearchResultGroupHeader = memo(function SearchResultGroupHeader({
  label,
}: {
  label: string;
}): React.JSX.Element {
  return (
    <Box sx={{px: 2, py: 0.75, backgroundColor: "action.hover"}}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          fontWeight: 600,
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
});

type SearchResultRowProps = {
  result: SearchResult;
  /** Show the trailing chevron (used by the spacious home-page list). */
  showChevron?: boolean;
};

/**
 * A single search-result row: leading avatar, a type chip, the label, and an
 * optional trailing chevron. Shared by both search surfaces so result rows look
 * identical wherever search is used. A result with no `to` (e.g. the
 * "No Results" sentinel) renders as plain, non-interactive text.
 */
export const SearchResultRow = memo(function SearchResultRow({
  result,
  showChevron = false,
}: SearchResultRowProps): React.JSX.Element {
  const theme = useTheme();

  if (!result.to) {
    return (
      <Box sx={{px: 2, py: 1.5}}>
        <Typography sx={{color: "text.secondary"}}>{result.label}</Typography>
      </Box>
    );
  }

  return (
    <Link
      to={result.to}
      color="inherit"
      underline="none"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        color: "text.primary",
        transition: "background-color 0.15s",
        "&:hover": {
          backgroundColor: "action.hover",
          opacity: 1,
        },
      }}
    >
      <SearchResultAvatar
        image={result.image}
        identiconKey={result.identiconKey}
        sizePx={24}
      />
      <Chip
        label={searchResultTypeLabel(result.type)}
        color={searchResultTypeChipColor(result.type)}
        size="small"
        sx={{flexShrink: 0, fontWeight: 600, fontSize: "0.7rem"}}
      />
      <Typography
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: theme.typography.stats.fontFamily,
          fontSize: "0.9rem",
        }}
      >
        {result.label}
      </Typography>
      {showChevron && (
        <ArrowForwardIosIcon
          sx={{flexShrink: 0, fontSize: "0.85rem", color: "text.disabled"}}
        />
      )}
    </Link>
  );
});
