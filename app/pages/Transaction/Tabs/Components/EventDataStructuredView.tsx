import {
  Box,
  Paper,
  Table,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type React from "react";
import HashButton, {HashType} from "../../../../components/HashButton";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";
import {tryStandardizeAddress} from "../../../../utils";
import {
  isPlainObject,
  sortedKeys,
  tryObjectAddressInner,
} from "./eventDataStructuredViewUtils";

const MAX_STRUCTURE_DEPTH = 4;
const MONO = {
  fontFamily: "monospace",
  fontSize: "0.8rem",
  overflowWrap: "anywhere" as const,
  wordBreak: "break-all" as const,
};

type FieldRowProps = {
  fieldKey: string;
  children: React.ReactNode;
  stackOnNarrow: boolean;
};

function FieldRow({fieldKey, children, stackOnNarrow}: FieldRowProps) {
  const theme = useTheme();
  if (stackOnNarrow) {
    return (
      <GeneralTableRow>
        <GeneralTableCell
          colSpan={2}
          sx={{
            verticalAlign: "top",
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 1.5,
            px: {xs: 1.5, sm: 2},
          }}
        >
          <Typography
            component="div"
            variant="caption"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.secondary,
              textTransform: "none",
              letterSpacing: 0,
              mb: 0.75,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {fieldKey}
          </Typography>
          <Box sx={{minWidth: 0, maxWidth: "100%"}}>{children}</Box>
        </GeneralTableCell>
      </GeneralTableRow>
    );
  }

  return (
    <GeneralTableRow>
      <GeneralTableCell
        component="th"
        scope="row"
        sx={{
          verticalAlign: "top",
          fontWeight: 600,
          color: "text.primary",
          width: "32%",
          maxWidth: {sm: "40%"},
          px: {xs: 1.5, sm: 2},
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {fieldKey}
      </GeneralTableCell>
      <GeneralTableCell
        sx={{
          verticalAlign: "top",
          minWidth: 0,
          maxWidth: "100%",
          px: {xs: 1.5, sm: 2},
        }}
      >
        {children}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function renderScalarString(s: string): React.ReactNode {
  const standardized = tryStandardizeAddress(s);
  if (standardized !== undefined) {
    return (
      <Box sx={{maxWidth: "100%", minWidth: 0}}>
        <HashButton hash={standardized} type={HashType.ACCOUNT} />
      </Box>
    );
  }
  return (
    <Typography component="span" variant="body2" sx={MONO}>
      {s}
    </Typography>
  );
}

type RenderValueProps = {
  value: unknown;
  depth: number;
  stackOnNarrow: boolean;
};

function RenderValue({
  value,
  depth,
  stackOnNarrow,
}: RenderValueProps): React.ReactNode {
  const theme = useTheme();

  if (value === null || value === undefined) {
    return (
      <Typography variant="body2" color={theme.palette.text.secondary}>
        —
      </Typography>
    );
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return (
      <Typography component="span" variant="body2" sx={MONO}>
        {String(value)}
      </Typography>
    );
  }

  if (typeof value === "string") {
    return renderScalarString(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Typography variant="body2" color={theme.palette.text.secondary}>
          []
        </Typography>
      );
    }

    if (depth >= MAX_STRUCTURE_DEPTH) {
      return (
        <Typography
          component="pre"
          variant="body2"
          sx={{
            ...MONO,
            m: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Typography>
      );
    }

    const allStrings = value.every((v) => typeof v === "string");
    if (allStrings) {
      return (
        <Box>
          {value.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional list
            <Box key={i} sx={{py: 0.25, minWidth: 0}}>
              {renderScalarString(item as string)}
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box>
        {value.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional list
          <Box key={i} sx={{py: 0.5}}>
            <Typography
              variant="caption"
              sx={{color: theme.palette.text.secondary, fontWeight: 600}}
            >
              [{i}]
            </Typography>
            <Box sx={{pl: {xs: 1, sm: 1.5}, pt: 0.25, minWidth: 0}}>
              <RenderValue
                value={item}
                depth={depth + 1}
                stackOnNarrow={stackOnNarrow}
              />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (isPlainObject(value)) {
    const addrInner = tryObjectAddressInner(value);
    if (addrInner !== undefined) {
      return (
        <Box sx={{maxWidth: "100%", minWidth: 0}}>
          <HashButton
            hash={tryStandardizeAddress(addrInner) ?? addrInner}
            type={HashType.ACCOUNT}
          />
        </Box>
      );
    }

    if (depth >= MAX_STRUCTURE_DEPTH) {
      return (
        <Typography
          component="pre"
          variant="body2"
          sx={{
            ...MONO,
            m: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Typography>
      );
    }

    return (
      <NestedObjectTable
        data={value}
        depth={depth + 1}
        stackOnNarrow={stackOnNarrow}
      />
    );
  }

  return (
    <Typography
      component="pre"
      variant="body2"
      sx={{
        ...MONO,
        m: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Typography>
  );
}

function NestedObjectTable({
  data,
  depth,
  stackOnNarrow,
}: {
  data: Record<string, unknown>;
  depth: number;
  stackOnNarrow: boolean;
}) {
  const keys = sortedKeys(data);
  return (
    <Paper variant="outlined" sx={{overflow: "hidden", mt: 0.5}}>
      <Table
        size="small"
        sx={{
          tableLayout: stackOnNarrow ? "auto" : "fixed",
          width: "100%",
        }}
      >
        <GeneralTableBody>
          {keys.map((k) => (
            <FieldRow key={k} fieldKey={k} stackOnNarrow={stackOnNarrow}>
              <RenderValue
                value={data[k]}
                depth={depth}
                stackOnNarrow={stackOnNarrow}
              />
            </FieldRow>
          ))}
        </GeneralTableBody>
      </Table>
    </Paper>
  );
}

type EventDataStructuredViewProps = {
  data: unknown;
};

/**
 * Generic key/value table for event `data`, matching the layout style of
 * `FeeStatementEventView` (Paper + label column + value column).
 */
export default function EventDataStructuredView({
  data,
}: EventDataStructuredViewProps) {
  const theme = useTheme();
  const stackOnNarrow = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isPlainObject(data)) {
    return (
      <Typography
        component="pre"
        variant="body2"
        sx={{
          ...MONO,
          m: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </Typography>
    );
  }

  const keys = sortedKeys(data);

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Table
          size="small"
          sx={{
            tableLayout: stackOnNarrow ? "auto" : "fixed",
            minWidth: stackOnNarrow ? "100%" : undefined,
            width: "100%",
          }}
        >
          <GeneralTableBody>
            {keys.map((k) => (
              <FieldRow key={k} fieldKey={k} stackOnNarrow={stackOnNarrow}>
                <RenderValue
                  value={data[k]}
                  depth={0}
                  stackOnNarrow={stackOnNarrow}
                />
              </FieldRow>
            ))}
          </GeneralTableBody>
        </Table>
      </Box>
    </Paper>
  );
}
