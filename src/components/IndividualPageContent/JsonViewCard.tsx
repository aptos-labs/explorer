import {Box, useTheme, alpha, Tooltip} from "@mui/material";
import React, {useState, useCallback, useRef} from "react";
import ReactJson from "react-json-view";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";

const TRANSPARENT = "rgba(0,0,0,0)";

const GROUP_ARRAYS_AFTER_LENGTH = 100;
const COLLAPSE_STRINGS_AFTER_LENGTH = 80;
const MAX_CARD_HEIGHT = 500;

function useJsonViewCardTheme() {
  const theme = useTheme();
  const textColor = theme.palette.primary.main;
  const secondaryTextColor = alpha(theme.palette.primary.main, 0.3);

  return {
    scheme: "aptos_explorer",
    author: "aptos",
    base00: TRANSPARENT,
    base01: textColor,
    base02: secondaryTextColor, // line color
    base03: textColor,
    base04: secondaryTextColor, // item count color
    base05: textColor,
    base06: textColor,
    base07: textColor, // key color
    base08: textColor,
    base09: textColor, // value and data type color
    base0A: textColor,
    base0B: textColor,
    base0C: textColor,
    base0D: secondaryTextColor, // object triangle color
    base0E: secondaryTextColor, // array triangle color
    base0F: textColor, // copy icon color
  };
}

type JsonViewCardProps = {
  data: unknown;
  collapsedByDefault?: boolean;
};

// ============================================================================
// Click-to-copy functionality for keys and values
// ============================================================================

const HOVER_DELAY_MS = 500;
const COPIED_DISPLAY_MS = 1500;

/**
 * Finds the copyable element (key or value) from a click/hover target.
 * Returns the element and its text content (values without quotes).
 */
function findCopyableElement(
  target: HTMLElement,
): {text: string; element: HTMLElement} | null {
  // Key elements
  const keyEl = target.closest(".object-key") || target.closest(".array-key");
  if (keyEl) {
    return {text: keyEl.textContent || "", element: keyEl as HTMLElement};
  }

  // String value
  if (target.classList.contains("string-value")) {
    return {
      text: (target.textContent || "").replace(/^"|"$/g, ""),
      element: target,
    };
  }

  // Other value types (number, boolean, null)
  const valueContainer = target.closest(".variable-value");
  if (valueContainer && !target.closest(".copy-to-clipboard-container")) {
    const span = target.closest("span") as HTMLElement | null;
    if (span?.parentElement?.classList.contains("variable-value")) {
      return {
        text: (span.textContent || "").replace(/^"|"$/g, ""),
        element: span,
      };
    }
  }

  return null;
}

/** Hook for click-to-copy tooltip state management */
function useCopyTooltip() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const copiedTimer = useRef<number | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    const copyable = findCopyableElement(e.target as HTMLElement);
    if (!copyable) return;

    e.preventDefault();
    e.stopPropagation();
    clearHoverTimer();

    try {
      await navigator.clipboard.writeText(copyable.text);
      setAnchor(copyable.element);
      setCopied(true);
      setOpen(true);

      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => {
        setOpen(false);
        setCopied(false);
        setAnchor(null);
      }, COPIED_DISPLAY_MS);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const handleMouseOver = useCallback(
    (e: React.MouseEvent) => {
      const copyable = findCopyableElement(e.target as HTMLElement);
      if (!copyable || copied) return;

      setAnchor(copyable.element);
      if (!hoverTimer.current) {
        hoverTimer.current = window.setTimeout(() => {
          setOpen(true);
          hoverTimer.current = null;
        }, HOVER_DELAY_MS);
      }
    },
    [copied],
  );

  const handleMouseOut = useCallback(
    (e: React.MouseEvent) => {
      if (!findCopyableElement(e.target as HTMLElement)) return;
      clearHoverTimer();
      if (!copied) {
        setOpen(false);
        setAnchor(null);
      }
    },
    [copied],
  );

  const handleMouseLeave = useCallback(() => {
    clearHoverTimer();
    if (!copied) {
      setOpen(false);
      setAnchor(null);
    }
  }, [copied]);

  return {
    tooltipOpen: open && anchor !== null,
    tooltipText: copied ? "Copied!" : "Click to copy",
    anchor,
    handleClick,
    handleMouseOver,
    handleMouseOut,
    handleMouseLeave,
  };
}

// ============================================================================

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const jsonViewCardTheme = useJsonViewCardTheme();

  const {
    tooltipOpen,
    tooltipText,
    anchor,
    handleClick,
    handleMouseOver,
    handleMouseOut,
    handleMouseLeave,
  } = useCopyTooltip();

  if (!data) {
    return <EmptyValue />;
  }

  const clickableHoverStyle = {
    cursor: "pointer",
    borderRadius: "2px",
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: semanticColors.codeBlock.background,
        overflow: "auto",
        maxHeight: MAX_CARD_HEIGHT,
        position: "relative",
        // Keep react-json-view copy button always visible when hovering the card
        "&:hover .copy-to-clipboard-container": {
          display: "inline-block !important",
        },
        "& .object-key, & .array-key": clickableHoverStyle,
        "& .string-value": clickableHoverStyle,
        "& .variable-value > span:first-of-type": clickableHoverStyle,
      }}
      padding={2}
      borderRadius={1}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onMouseLeave={handleMouseLeave}
    >
      <Tooltip
        open={tooltipOpen}
        title={tooltipText}
        placement="top"
        PopperProps={{anchorEl: anchor}}
        componentsProps={{
          tooltip: {sx: {fontSize: "0.75rem"}},
        }}
      >
        <Box sx={{display: "contents"}} />
      </Tooltip>
      <ReactJson
        src={data}
        theme={jsonViewCardTheme}
        name={null}
        collapseStringsAfterLength={COLLAPSE_STRINGS_AFTER_LENGTH}
        displayObjectSize={false}
        displayDataTypes={false}
        quotesOnKeys={false}
        groupArraysAfterLength={GROUP_ARRAYS_AFTER_LENGTH}
        style={{
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular,
          fontSize: theme.typography.fontSize,
        }}
        collapsed={collapsedByDefault}
      />
    </Box>
  );
}
