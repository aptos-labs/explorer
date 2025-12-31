import {Box, useTheme, alpha, Tooltip} from "@mui/material";
import React, {useState, useCallback, useRef} from "react";
import ReactJson from "react-json-view";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";

const TRANSPARENT = "rgba(0,0,0,0)";

const GROUP_ARRAYS_AFTER_LENGTH = 100;
const COLLAPSE_STRINGS_AFTER_LENGTH = 80;
const MAX_CARD_HEIGHT = 500;

// Tooltip messages
const TOOLTIP_COPY = "Click to copy";
const TOOLTIP_COPIED = "Copied!";

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

// Check if element is a copyable key or value
function getCopyableElement(
  element: HTMLElement,
): {type: "key" | "value"; text: string; element: HTMLElement} | null {
  // Check for object key - direct match
  if (element.classList.contains("object-key")) {
    return {type: "key", text: element.textContent || "", element};
  }

  // Check for object key - might be clicking on child span inside object-key
  const parentObjectKey = element.closest(".object-key") as HTMLElement | null;
  if (parentObjectKey) {
    return {
      type: "key",
      text: parentObjectKey.textContent || "",
      element: parentObjectKey,
    };
  }

  // Check for array index key (e.g., 0, 1, 2...)
  if (element.classList.contains("array-key")) {
    return {type: "key", text: element.textContent || "", element};
  }

  // Check for string value (inside variable-value span)
  if (element.classList.contains("string-value")) {
    // Get the text without surrounding quotes
    const text = element.textContent || "";
    // Remove surrounding quotes if present
    const unquoted = text.replace(/^"|"$/g, "");
    return {type: "value", text: unquoted, element};
  }

  // Check if it's a direct value element (number, boolean, null, etc.)
  const parentVariableValue = element.closest(".variable-value");
  if (parentVariableValue && !element.closest(".copy-to-clipboard-container")) {
    // Check if the element itself contains the value (not a wrapper)
    const spanElement = element.closest("span") as HTMLElement | null;
    if (
      spanElement &&
      spanElement.parentElement?.classList.contains("variable-value")
    ) {
      const text = spanElement.textContent || "";
      // Remove surrounding quotes for strings
      const unquoted = text.replace(/^"|"$/g, "");
      return {type: "value", text: unquoted, element: spanElement};
    }
  }

  return null;
}

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const jsonViewCardTheme = useJsonViewCardTheme();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState(TOOLTIP_COPY);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  // Handle click to copy
  const handleClick = useCallback(async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const copyable = getCopyableElement(target);

    if (copyable) {
      event.preventDefault();
      event.stopPropagation();

      // Clear hover timeout
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      try {
        await navigator.clipboard.writeText(copyable.text);
        setAnchorEl(copyable.element);
        setTooltipText(TOOLTIP_COPIED);
        setTooltipOpen(true);

        // Clear previous copy timeout if exists
        if (copyTimeoutRef.current) {
          window.clearTimeout(copyTimeoutRef.current);
        }

        // Reset tooltip after delay
        copyTimeoutRef.current = window.setTimeout(() => {
          setTooltipOpen(false);
          setTooltipText(TOOLTIP_COPY);
          setAnchorEl(null);
        }, 1500);
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        console.error("Failed to copy:", err);
      }
    }
  }, []);

  // Handle mouse over to detect hoverable elements and show tooltip
  const handleMouseOver = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      const copyable = getCopyableElement(target);

      if (copyable) {
        // Get the actual element to anchor the tooltip
        const element = copyable.element;
        setAnchorEl(element);

        // Only set up hover delay if not already showing "Copied!" message
        if (tooltipText === TOOLTIP_COPY && !hoverTimeoutRef.current) {
          hoverTimeoutRef.current = window.setTimeout(() => {
            setTooltipOpen(true);
            hoverTimeoutRef.current = null;
          }, 500); // 500ms delay before showing tooltip
        }
      }
    },
    [tooltipText],
  );

  // Handle mouse out from copyable elements
  const handleMouseOut = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      const copyable = getCopyableElement(target);

      if (copyable) {
        // Clear hover timeout if moving away from copyable element
        if (hoverTimeoutRef.current) {
          window.clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        if (tooltipText === TOOLTIP_COPY) {
          setTooltipOpen(false);
          setAnchorEl(null);
        }
      }
    },
    [tooltipText],
  );

  // Handle mouse leave from the container
  const handleMouseLeave = useCallback(() => {
    // Clear hover timeout
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (tooltipText === TOOLTIP_COPY) {
      setTooltipOpen(false);
      setAnchorEl(null);
    }
  }, [tooltipText]);

  if (!data) {
    return <EmptyValue />;
  }

  return (
    <Box
      sx={{
        backgroundColor: semanticColors.codeBlock.background,
        overflow: "auto",
        maxHeight: MAX_CARD_HEIGHT,
        position: "relative",
        // Style for clickable keys and values - cursor pointer only on specific elements
        "& .object-key, & .array-key": {
          cursor: "pointer",
          borderRadius: "2px",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
          },
        },
        "& .string-value": {
          cursor: "pointer",
          borderRadius: "2px",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
          },
        },
        "& .variable-value > span:first-of-type": {
          cursor: "pointer",
          borderRadius: "2px",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
          },
        },
      }}
      padding={2}
      borderRadius={1}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onMouseLeave={handleMouseLeave}
    >
      <Tooltip
        open={tooltipOpen && anchorEl !== null}
        title={tooltipText}
        placement="top"
        PopperProps={{
          anchorEl: anchorEl,
        }}
        componentsProps={{
          tooltip: {
            sx: {
              fontSize: "0.75rem",
            },
          },
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
