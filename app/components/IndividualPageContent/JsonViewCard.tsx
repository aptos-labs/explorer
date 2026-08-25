import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import type {CSSProperties, MouseEvent as ReactMouseEvent} from "react";
import {lazy, Suspense, useEffect, useRef, useState} from "react";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";

// Dynamically import @uiw/react-json-view only on client side (React 19 compatible)
const JsonView = lazy(() => import("@uiw/react-json-view"));
const JsonRow = lazy(() =>
  import("@uiw/react-json-view").then(({Row}) => ({
    default: Row,
  })),
);

const MAX_CARD_HEIGHT = 500;
const COPY_FEEDBACK_MS = 1500;

type JsonViewCardProps = {
  data: unknown;
  collapsedByDefault?: boolean;
};

type CopyStatus = "idle" | "copied" | "error";

function stringifyCopyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && value === Infinity) return "Infinity";
  if (typeof value === "number" && Number.isNaN(value)) return "NaN";
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toLocaleString();

  const copyText = JSON.stringify(
    value,
    (_, nestedValue) =>
      typeof nestedValue === "bigint" ? nestedValue.toString() : nestedValue,
    2,
  );

  return copyText ?? String(value);
}

async function copyTextToClipboard(copyText: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(copyText);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = copyText;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);

  try {
    textarea.select();
    if (!document.execCommand("copy")) {
      throw new Error("Clipboard copy failed");
    }
  } finally {
    textarea.remove();
  }
}

function CopyValueButton({
  value,
  keyName,
  className,
  label,
  showLabel = false,
}: {
  value: unknown;
  keyName?: string | number;
  className?: string;
  label?: string;
  showLabel?: boolean;
}) {
  const theme = useTheme();
  const [status, setStatus] = useState<CopyStatus>("idle");
  const feedbackTimer = useRef<number | null>(null);
  const idleLabel =
    label ??
    (keyName === undefined
      ? "Copy JSON value"
      : `Copy ${String(keyName)} value`);
  const buttonLabel =
    status === "copied"
      ? "Copied"
      : status === "error"
        ? "Copy failed"
        : idleLabel;

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) {
        window.clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  const handleClick = async (event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (feedbackTimer.current !== null) {
      window.clearTimeout(feedbackTimer.current);
    }

    try {
      await copyTextToClipboard(stringifyCopyValue(value));
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    feedbackTimer.current = window.setTimeout(() => {
      setStatus("idle");
      feedbackTimer.current = null;
    }, COPY_FEEDBACK_MS);
  };

  const icon =
    status === "copied" ? (
      <CheckIcon sx={{fontSize: "0.9rem"}} />
    ) : status === "error" ? (
      <ErrorOutlineIcon sx={{fontSize: "0.9rem"}} />
    ) : (
      <ContentCopyIcon sx={{fontSize: "0.9rem"}} />
    );

  const buttonSx = {
    ml: 0.5,
    p: "2px",
    verticalAlign: "middle",
    color:
      status === "copied"
        ? theme.palette.success.main
        : status === "error"
          ? theme.palette.error.main
          : theme.palette.text.secondary,
    "&:hover": {
      color:
        status === "error"
          ? theme.palette.error.dark
          : theme.palette.primary.main,
      backgroundColor: alpha(
        status === "error"
          ? theme.palette.error.main
          : theme.palette.primary.main,
        0.12,
      ),
    },
  };

  return (
    <Tooltip title={buttonLabel} placement="top" arrow>
      {showLabel ? (
        <Button
          aria-label={buttonLabel}
          size="small"
          variant="outlined"
          startIcon={icon}
          onClick={handleClick}
          sx={{...buttonSx, p: "4px 10px"}}
        >
          {buttonLabel}
        </Button>
      ) : (
        <IconButton
          className={className}
          aria-label={buttonLabel}
          size="small"
          onClick={handleClick}
          sx={buttonSx}
        >
          {icon}
        </IconButton>
      )}
    </Tooltip>
  );
}

export default function JsonViewCard({
  data,
  collapsedByDefault,
}: JsonViewCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  // Key color: warm coral tone for visual distinction from values (from theme)
  const keyColor = semanticColors.jsonView.key;

  // Value color: cool blue tone (primary color)
  const valueColor = theme.palette.primary.main;
  // Solid muted tone — alpha(primary) was ~2.1:1 on light code panels (WCAG)
  const secondaryTextColor = semanticColors.codeBlock.textSecondary;

  if (!data) {
    return <EmptyValue />;
  }

  const longStringHoverStyle = {
    cursor: "pointer",
    borderRadius: "2px",
    transition: "background-color 0.15s ease",
    "&:hover": {
      backgroundColor: alpha(valueColor, 0.15),
    },
  };

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 1,
        backgroundColor: semanticColors.codeBlock.background,
        overflow: "auto",
        maxWidth: "100%",
        maxHeight: MAX_CARD_HEIGHT,
        position: "relative",
        // Only long strings are clickable because they expand/collapse on click.
        ".w-rjv-value-short": longStringHoverStyle,
        ".w-rjv-line .json-copy-action": {
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.15s ease",
          minWidth: 32,
          minHeight: 32,
        },
        ".w-rjv-line:hover .json-copy-action, .w-rjv-line:focus-within .json-copy-action":
          {
            opacity: 1,
            pointerEvents: "auto",
          },
        "@media (hover: none), (pointer: coarse)": {
          ".w-rjv-line .json-copy-action": {
            opacity: 1,
            pointerEvents: "auto",
            minWidth: 40,
            minHeight: 40,
          },
        },
      }}
    >
      <Box
        sx={{
          display: "none",
          justifyContent: "flex-end",
          mb: 1,
          "@media (hover: none), (pointer: coarse)": {
            display: "flex",
          },
        }}
      >
        <CopyValueButton value={data} label="Copy JSON" showLabel />
      </Box>
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
              // Key: warm coral tone for visual distinction
              "--w-rjv-key-string": keyColor,
              // Values: cool blue tone
              "--w-rjv-type-string-color": valueColor,
              "--w-rjv-type-int-color": valueColor,
              "--w-rjv-type-float-color": valueColor,
              "--w-rjv-type-boolean-color": valueColor,
              // Secondary elements: muted
              "--w-rjv-type-null-color": secondaryTextColor,
              "--w-rjv-arrow-color": secondaryTextColor,
              "--w-rjv-brackets-color": secondaryTextColor,
              "--w-rjv-colon-color": secondaryTextColor,
              "--w-rjv-ellipsis-color": secondaryTextColor,
              "--w-rjv-info-color": secondaryTextColor,
            } as CSSProperties
          }
        >
          <JsonRow
            render={(props, {keyName, value}) => (
              <Box
                {...props}
                sx={{
                  "& .json-copy-action": {
                    display: "inline-flex",
                  },
                }}
              >
                {props.children}
                <CopyValueButton
                  className="json-copy-action"
                  keyName={keyName}
                  value={value}
                />
              </Box>
            )}
          />
        </JsonView>
      </Suspense>
    </Box>
  );
}
