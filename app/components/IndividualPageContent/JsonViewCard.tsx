import DataObjectIcon from "@mui/icons-material/DataObject";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  alpha,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Popper,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import type React from "react";
import {lazy, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";
import JsonTableView from "./JsonTableView";

// Dynamically import @uiw/react-json-view only on client side (React 19 compatible)
const JsonView = lazy(() => import("@uiw/react-json-view"));

const MAX_CARD_HEIGHT = 500;
const HOVER_DELAY_MS = 500;
const COPIED_DISPLAY_MS = 1500;

type ViewMode = "json" | "table";

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
      if (anchor?.contains(target)) return;

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

function isTableRenderable(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  if (Array.isArray(data)) return data.length > 0;
  return Object.keys(data as Record<string, unknown>).length > 0;
}

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const [viewMode, setViewMode] = useState<ViewMode>("json");

  const keyColor = semanticColors.jsonView.key;
  const valueColor = theme.palette.primary.main;
  const secondaryTextColor = semanticColors.codeBlock.textSecondary;

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

  const canShowTable = isTableRenderable(data);

  const baseHoverStyle = {
    cursor: "pointer",
    borderRadius: "2px",
    transition: "background-color 0.15s ease",
  };

  const keyHoverStyle = {
    ...baseHoverStyle,
    "&:hover": {
      backgroundColor: alpha(keyColor, 0.15),
    },
  };

  const valueHoverStyle = {
    ...baseHoverStyle,
    "&:hover": {
      backgroundColor: alpha(valueColor, 0.15),
    },
  };

  return (
    <Box sx={{position: "relative", width: "100%"}}>
      {canShowTable && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            zIndex: 1,
          }}
        >
          <Tooltip title="JSON view" placement="top">
            <IconButton
              size="small"
              onClick={() => setViewMode("json")}
              sx={{
                borderRadius: 1,
                backgroundColor:
                  viewMode === "json"
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                color:
                  viewMode === "json"
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <DataObjectIcon sx={{fontSize: 18}} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Table view" placement="top">
            <IconButton
              size="small"
              onClick={() => setViewMode("table")}
              sx={{
                borderRadius: 1,
                backgroundColor:
                  viewMode === "table"
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                color:
                  viewMode === "table"
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <TableChartOutlinedIcon sx={{fontSize: 18}} />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {viewMode === "table" && canShowTable ? (
        <JsonTableView data={data} />
      ) : (
        <Box
          sx={{
            backgroundColor: semanticColors.codeBlock.background,
            overflow: "auto",
            maxHeight: MAX_CARD_HEIGHT,
            position: "relative",
            '& [class*="object-key"]': keyHoverStyle,
            '& [class*="-value"]': valueHoverStyle,
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
                  "--w-rjv-key-string": keyColor,
                  "--w-rjv-type-string-color": valueColor,
                  "--w-rjv-type-int-color": valueColor,
                  "--w-rjv-type-float-color": valueColor,
                  "--w-rjv-type-boolean-color": valueColor,
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
      )}
    </Box>
  );
}
