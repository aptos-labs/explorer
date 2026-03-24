import {
  Box,
  Paper,
  Table,
  TableContainer,
  TableHead,
  Typography,
  useTheme,
} from "@mui/material";
import {memo, type ReactNode, useMemo} from "react";
import HashButton, {HashType} from "../HashButton";
import GeneralTableBody from "../Table/GeneralTableBody";
import GeneralTableCell from "../Table/GeneralTableCell";
import GeneralTableHeaderCell from "../Table/GeneralTableHeaderCell";
import GeneralTableRow from "../Table/GeneralTableRow";

const MAX_DEPTH = 4;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{1,64}$/;
const MOVE_TYPE_REGEX = /^0x[a-fA-F0-9]+::\w+::\w+/;

function isAddress(value: unknown): value is string {
  return typeof value === "string" && ADDRESS_REGEX.test(value);
}

function isMoveType(value: unknown): value is string {
  return typeof value === "string" && MOVE_TYPE_REGEX.test(value);
}

function isHomogeneousObjectArray(
  arr: unknown[],
): arr is Record<string, unknown>[] {
  if (arr.length === 0) return false;
  if (arr.some((item) => typeof item !== "object" || item === null)) {
    return false;
  }
  const objects = arr as Record<string, unknown>[];
  const firstKeys = Object.keys(objects[0]).sort().join(",");
  return objects.every(
    (obj) => Object.keys(obj).sort().join(",") === firstKeys,
  );
}

function formatKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function PrimitiveValue({value}: {value: unknown}) {
  const theme = useTheme();

  if (value === null || value === undefined) {
    return (
      <Typography
        component="span"
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          fontStyle: "italic",
          fontFamily: "monospace",
          fontSize: "0.8rem",
        }}
      >
        {value === null ? "null" : "undefined"}
      </Typography>
    );
  }

  if (typeof value === "boolean") {
    return (
      <Typography
        component="span"
        variant="body2"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.8rem",
          color: value ? theme.palette.success.main : theme.palette.error.main,
        }}
      >
        {value.toString()}
      </Typography>
    );
  }

  const strVal = String(value);

  if (isAddress(value)) {
    const hashType = isMoveType(value) ? HashType.OTHERS : HashType.ACCOUNT;
    return <HashButton hash={strVal} type={hashType} size="small" />;
  }

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        fontFamily: "monospace",
        fontSize: "0.8rem",
        wordBreak: "break-all",
        overflowWrap: "anywhere",
      }}
    >
      {strVal}
    </Typography>
  );
}

function JsonValueCell({value, depth}: {value: unknown; depth: number}) {
  if (value === null || value === undefined) {
    return <PrimitiveValue value={value} />;
  }

  if (typeof value !== "object") {
    return <PrimitiveValue value={value} />;
  }

  if (depth >= MAX_DEPTH) {
    return <PrimitiveValue value={JSON.stringify(value)} />;
  }

  if (Array.isArray(value)) {
    return <JsonArrayView data={value} depth={depth + 1} />;
  }

  return (
    <JsonObjectTable
      data={value as Record<string, unknown>}
      depth={depth + 1}
    />
  );
}

const JsonObjectTable = memo(function JsonObjectTable({
  data,
  depth,
}: {
  data: Record<string, unknown>;
  depth: number;
}) {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <PrimitiveValue value="{}" />;
  }

  return (
    <Table
      size="small"
      sx={{
        tableLayout: "auto",
        "& td, & th": {borderBottom: "1px solid", borderColor: "divider"},
      }}
    >
      <GeneralTableBody>
        {entries.map(([key, value]) => (
          <GeneralTableRow key={key}>
            <GeneralTableCell
              component="th"
              scope="row"
              sx={{
                verticalAlign: "top",
                fontWeight: 600,
                color: "text.primary",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
                width: "1%",
                paddingY: 1,
                paddingX: 1.5,
              }}
            >
              {formatKey(key)}
            </GeneralTableCell>
            <GeneralTableCell
              sx={{
                verticalAlign: "top",
                paddingY: 1,
                paddingX: 1.5,
              }}
            >
              <JsonValueCell value={value} depth={depth} />
            </GeneralTableCell>
          </GeneralTableRow>
        ))}
      </GeneralTableBody>
    </Table>
  );
});

function JsonColumnarTable({
  data,
  depth,
}: {
  data: Record<string, unknown>[];
  depth: number;
}) {
  const columns = useMemo(() => Object.keys(data[0]), [data]);

  return (
    <TableContainer>
      <Table
        size="small"
        sx={{
          tableLayout: "auto",
          "& td, & th": {borderBottom: "1px solid", borderColor: "divider"},
        }}
      >
        <TableHead>
          <GeneralTableRow>
            {columns.map((col) => (
              <GeneralTableHeaderCell key={col} header={formatKey(col)} />
            ))}
          </GeneralTableRow>
        </TableHead>
        <GeneralTableBody>
          {data.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: no stable key
            <GeneralTableRow key={i}>
              {columns.map((col) => (
                <GeneralTableCell
                  key={col}
                  sx={{verticalAlign: "top", paddingY: 1, paddingX: 1.5}}
                >
                  <JsonValueCell value={row[col]} depth={depth} />
                </GeneralTableCell>
              ))}
            </GeneralTableRow>
          ))}
        </GeneralTableBody>
      </Table>
    </TableContainer>
  );
}

function JsonArrayView({data, depth}: {data: unknown[]; depth: number}) {
  const theme = useTheme();

  if (data.length === 0) {
    return <PrimitiveValue value="[]" />;
  }

  if (isHomogeneousObjectArray(data)) {
    return <JsonColumnarTable data={data} depth={depth} />;
  }

  const allPrimitive = data.every(
    (item) => typeof item !== "object" || item === null,
  );

  if (allPrimitive) {
    return (
      <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
        {data.map((item, i) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: no stable key
            key={i}
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: theme.palette.action.hover,
              fontFamily: "monospace",
              fontSize: "0.8rem",
            }}
          >
            <PrimitiveValue value={item} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Table
      size="small"
      sx={{
        tableLayout: "auto",
        "& td, & th": {borderBottom: "1px solid", borderColor: "divider"},
      }}
    >
      <GeneralTableBody>
        {data.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: no stable key
          <GeneralTableRow key={i}>
            <GeneralTableCell
              component="th"
              scope="row"
              sx={{
                verticalAlign: "top",
                fontWeight: 600,
                color: "text.secondary",
                fontSize: "0.75rem",
                width: "1%",
                paddingY: 1,
                paddingX: 1.5,
              }}
            >
              [{i}]
            </GeneralTableCell>
            <GeneralTableCell
              sx={{verticalAlign: "top", paddingY: 1, paddingX: 1.5}}
            >
              <JsonValueCell value={item} depth={depth} />
            </GeneralTableCell>
          </GeneralTableRow>
        ))}
      </GeneralTableBody>
    </Table>
  );
}

type JsonTableViewProps = {
  data: unknown;
};

export default function JsonTableView({data}: JsonTableViewProps): ReactNode {
  const theme = useTheme();

  if (!data || typeof data !== "object") {
    return <PrimitiveValue value={data} />;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "auto",
        maxHeight: 600,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {Array.isArray(data) ? (
        <JsonArrayView data={data} depth={0} />
      ) : (
        <JsonObjectTable data={data as Record<string, unknown>} depth={0} />
      )}
    </Paper>
  );
}
