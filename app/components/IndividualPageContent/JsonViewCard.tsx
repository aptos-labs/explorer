import {
  Box,
  useTheme,
  alpha,
  CircularProgress,
  Popper,
  Paper,
} from "@mui/material";
import React, {
  lazy,
  Suspense,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";

// Dynamically import @uiw/react-json-view only on client side (React 19 compatible)
const JsonView = lazy(() => import("@uiw/react-json-view"));

const MAX_CARD_HEIGHT = 500;
const HOVER_DELAY_MS = 500;
const COPIED_DISPLAY_MS = 1500;

type JsonViewCardProps = {
  data: unknown;
  collapsedByDefault?: boolean;
};

/**
 * Finds the copyable element (key or value) from a click/hover target.
 * Returns the element and its text content.
 */
function findCopyableElement(
  target: HTMLElement,
): {text: string; element: HTMLElement} | null {
  // Look for key elements (w-rjv-object-key class from @uiw/react-json-view)
  const keyEl = target.closest('[class*="object-key"]');
  if (keyEl) {
    return {text: keyEl.textContent || "", element: keyEl as HTMLElement};
  }

  // Look for value elements
  const valueEl = target.closest('[class*="value"]');
  if (valueEl && !target.closest('[class*="copy"]')) {
    // Remove quotes from string values
    const text = (valueEl.textContent || "").replace(/^"|"$/g, "");
    return {text, element: valueEl as HTMLElement};
  }

  return null;
}

/**
 * Hook for click-to-copy tooltip state management.
 */
function useCopyTooltip() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimer.current) {
      window.clearTimeout(feedbackTimer.current);
      feedbackTimer.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    };
  }, []);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
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
      } catch {
        setStatus("error");
      }

      clearFeedbackTimer();
      feedbackTimer.current = window.setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setAnchor(null);
      }, COPIED_DISPLAY_MS);
    },
    [clearHoverTimer, clearFeedbackTimer],
  );

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
    [status, anchor, clearHoverTimer],
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
    [status, clearHoverTimer],
  );

  const handleMouseLeave = useCallback(() => {
    clearHoverTimer();
    if (status === "idle") {
      setOpen(false);
      setAnchor(null);
    }
  }, [status, clearHoverTimer]);

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

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const textColor = theme.palette.primary.main;
  const secondaryTextColor = alpha(theme.palette.primary.main, 0.3);

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
        overflowY: "auto",
        overflowX: "hidden",
        maxHeight: MAX_CARD_HEIGHT,
        position: "relative",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        // Hoverable elements
        '& [class*="object-key"]': clickableHoverStyle,
        '& [class*="string-value"]': clickableHoverStyle,
        '& [class*="int-value"]': clickableHoverStyle,
        '& [class*="float-value"]': clickableHoverStyle,
        '& [class*="bool-value"]': clickableHoverStyle,
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
        sx={{zIndex: theme.zIndex.tooltip}}
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
      <Suspense fallback={<CircularProgress size={24} />}>
        <JsonView
          value={data as object}
          collapsed={collapsedByDefault ? 1 : false}
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard={false}
          indentWidth={24}
          shortenTextAfterLength={80}
          style={
            {
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.fontSize,
              lineHeight: 1.6,
              backgroundColor: "transparent",
              // Custom colors using CSS variables
              "--w-rjv-key-string": textColor,
              "--w-rjv-type-string-color": textColor,
              "--w-rjv-type-int-color": textColor,
              "--w-rjv-type-float-color": textColor,
              "--w-rjv-type-boolean-color": textColor,
              "--w-rjv-type-null-color": secondaryTextColor,
              "--w-rjv-arrow-color": secondaryTextColor,
              "--w-rjv-brackets-color": secondaryTextColor,
              "--w-rjv-colon-color": secondaryTextColor,
              "--w-rjv-ellipsis-color": secondaryTextColor,
              "--w-rjv-info-color": secondaryTextColor,
            } as React.CSSProperties
          }
        />
      </Suspense>
    </Box>
  );
}
