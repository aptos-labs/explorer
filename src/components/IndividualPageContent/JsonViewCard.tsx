import {Box, useTheme, alpha, Popper, Paper} from "@mui/material";
import React, {useState, useCallback, useRef, useEffect} from "react";
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

/**
 * Hook for click-to-copy tooltip state management.
 *
 * Manages:
 * - Tooltip visibility and anchor element positioning
 * - Copy status: "idle" (hovering), "copied" (success), "error" (failed)
 * - Hover timer: delays tooltip appearance by HOVER_DELAY_MS
 * - Feedback timer: auto-hides tooltip after COPIED_DISPLAY_MS
 *
 * @returns {Object} Tooltip state and event handlers
 * @returns {boolean} tooltipOpen - Whether tooltip should be visible
 * @returns {string} tooltipText - "Click to copy" | "Copied!" | "Failed to copy"
 * @returns {boolean} isError - Whether copy failed (for error styling)
 * @returns {HTMLElement|null} anchor - Element to anchor tooltip to
 * @returns {Function} handleClick - Click handler for copying
 * @returns {Function} handleMouseOver - Mouse enter handler for hover tooltip
 * @returns {Function} handleMouseOut - Mouse leave handler for copyable elements
 * @returns {Function} handleMouseLeave - Mouse leave handler for container
 */
function useCopyTooltip() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const clearFeedbackTimer = () => {
    if (feedbackTimer.current) {
      window.clearTimeout(feedbackTimer.current);
      feedbackTimer.current = null;
    }
  };

  // Cleanup timers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      clearHoverTimer();
      clearFeedbackTimer();
    };
  }, []);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    const copyable = findCopyableElement(e.target as HTMLElement);
    if (!copyable) return;

    e.preventDefault();
    e.stopPropagation();
    clearHoverTimer();

    setAnchor(copyable.element);
    setOpen(true);

    try {
      await navigator.clipboard.writeText(copyable.text);
      setStatus("copied");
    } catch (err) {
      console.error("Failed to copy:", err);
      setStatus("error");
    }

    clearFeedbackTimer();
    feedbackTimer.current = window.setTimeout(() => {
      setOpen(false);
      setStatus("idle");
      setAnchor(null);
    }, COPIED_DISPLAY_MS);
  }, []);

  const handleMouseOver = useCallback(
    (e: React.MouseEvent) => {
      if (status !== "idle") return;

      const target = e.target as HTMLElement;

      // Skip if still hovering the same anchor element
      if (anchor && anchor.contains(target)) return;

      const copyable = findCopyableElement(target);
      if (!copyable) return;

      // Moving to a different element, reset timer and anchor
      clearHoverTimer();
      setOpen(false);
      setAnchor(copyable.element);

      hoverTimer.current = window.setTimeout(() => {
        setOpen(true);
        hoverTimer.current = null;
      }, HOVER_DELAY_MS);
    },
    [status, anchor],
  );

  const handleMouseOut = useCallback(
    (e: React.MouseEvent) => {
      if (!findCopyableElement(e.target as HTMLElement)) return;
      clearHoverTimer();
      if (status === "idle") {
        setOpen(false);
        setAnchor(null);
      }
    },
    [status],
  );

  const handleMouseLeave = useCallback(() => {
    clearHoverTimer();
    if (status === "idle") {
      setOpen(false);
      setAnchor(null);
    }
  }, [status]);

  const tooltipText =
    status === "copied"
      ? "Copied!"
      : status === "error"
        ? "Failed to copy"
        : "Click to copy";

  return {
    tooltipOpen: open && anchor !== null,
    tooltipText,
    isError: status === "error",
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
    isError,
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
      <Popper
        open={tooltipOpen}
        anchorEl={anchor}
        placement="top"
        sx={{zIndex: 1500}}
      >
        <Paper
          sx={{
            px: 1,
            py: 0.5,
            fontSize: "0.75rem",
            backgroundColor: isError
              ? theme.palette.error.main
              : theme.palette.grey[800],
            color: theme.palette.common.white,
          }}
        >
          {tooltipText}
        </Paper>
      </Popper>
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
