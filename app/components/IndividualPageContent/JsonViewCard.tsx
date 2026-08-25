import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  alpha,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import type {CSSProperties, MouseEvent as ReactMouseEvent} from "react";
import {lazy, Suspense} from "react";
import {getSemanticColors} from "../../themes/colors/aptosBrandColors";
import EmptyValue from "./ContentValue/EmptyValue";

// Dynamically import @uiw/react-json-view only on client side (React 19 compatible)
const JsonView = lazy(() => import("@uiw/react-json-view"));
const Copied = lazy(() =>
  import("@uiw/react-json-view").then(({Copied: JsonCopied}) => ({
    default: JsonCopied,
  })),
);

const MAX_CARD_HEIGHT = 500;

type JsonViewCardProps = {
  data: unknown;
  collapsedByDefault?: boolean;
};

function CopyButton({
  copied,
  keyName,
  onClick,
}: {
  copied: boolean;
  keyName?: string | number;
  onClick?: (event: ReactMouseEvent<SVGSVGElement>) => void;
}) {
  const theme = useTheme();
  const label = copied
    ? "Copied"
    : keyName === undefined
      ? "Copy JSON value"
      : `Copy ${String(keyName)} value`;

  return (
    <Tooltip title={label} placement="top" arrow>
      <IconButton
        aria-label={label}
        size="small"
        onClick={(event) =>
          onClick?.(event as unknown as ReactMouseEvent<SVGSVGElement>)
        }
        sx={{
          ml: 0.5,
          p: "2px",
          verticalAlign: "middle",
          color: copied
            ? theme.palette.success.main
            : theme.palette.text.secondary,
          "&:hover": {
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        }}
      >
        {copied ? (
          <CheckIcon sx={{fontSize: "0.9rem"}} />
        ) : (
          <ContentCopyIcon sx={{fontSize: "0.9rem"}} />
        )}
      </IconButton>
    </Tooltip>
  );
}

/** Keep string copying consistent with the previous value-copy behavior. */
function normalizeCopyText(copyText: string, value: unknown) {
  return typeof value === "string" ? value : copyText;
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
      }}
    >
      <Suspense fallback={<CircularProgress size={24} />}>
        <JsonView
          value={data as object}
          collapsed={collapsedByDefault ? 1 : false}
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard={true}
          indentWidth={24}
          shortenTextAfterLength={80}
          beforeCopy={(copyText, _keyName, value) =>
            normalizeCopyText(copyText, value)
          }
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
          <Copied
            render={({"data-copied": copied, onClick}, {keyName}) => (
              <CopyButton
                copied={Boolean(copied)}
                keyName={keyName}
                onClick={onClick}
              />
            )}
          />
        </JsonView>
      </Suspense>
    </Box>
  );
}
