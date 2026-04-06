import {Box, Paper, Table, Typography, useTheme} from "@mui/material";
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
};

function FieldRow({fieldKey, children}: FieldRowProps) {
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
        }}
      >
        {fieldKey}
      </GeneralTableCell>
      <GeneralTableCell sx={{verticalAlign: "top"}}>
        {children}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function renderScalarString(s: string): React.ReactNode {
  const standardized = tryStandardizeAddress(s);
  if (standardized !== undefined) {
    return <HashButton hash={standardized} type={HashType.ACCOUNT} />;
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
};

function RenderValue({value, depth}: RenderValueProps): React.ReactNode {
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
            <Box key={i} sx={{py: 0.25}}>
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
            <Box sx={{pl: 1.5, pt: 0.25}}>
              <RenderValue value={item} depth={depth + 1} />
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
        <HashButton
          hash={tryStandardizeAddress(addrInner) ?? addrInner}
          type={HashType.ACCOUNT}
        />
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
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Typography>
      );
    }

    return <NestedObjectTable data={value} depth={depth + 1} />;
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
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Typography>
  );
}

function NestedObjectTable({
  data,
  depth,
}: {
  data: Record<string, unknown>;
  depth: number;
}) {
  const keys = sortedKeys(data);
  return (
    <Paper variant="outlined" sx={{overflow: "hidden", mt: 0.5}}>
      <Table size="small" sx={{tableLayout: "fixed"}}>
        <GeneralTableBody>
          {keys.map((k) => (
            <FieldRow key={k} fieldKey={k}>
              <RenderValue value={data[k]} depth={depth} />
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
        }}
      >
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </Typography>
    );
  }

  const keys = sortedKeys(data);

  return (
    <Paper variant="outlined" sx={{overflow: "hidden"}}>
      <Table size="small" sx={{tableLayout: "fixed"}}>
        <GeneralTableBody>
          {keys.map((k) => (
            <FieldRow key={k} fieldKey={k}>
              <RenderValue value={data[k]} depth={0} />
            </FieldRow>
          ))}
        </GeneralTableBody>
      </Table>
    </Paper>
  );
}
