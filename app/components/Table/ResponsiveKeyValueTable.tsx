import {
  Box,
  type Breakpoint,
  Stack,
  Table,
  TableContainer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type {SxProps, Theme} from "@mui/material/styles";
import * as React from "react";
import GeneralTableBody from "./GeneralTableBody";
import GeneralTableCell from "./GeneralTableCell";
import GeneralTableRow from "./GeneralTableRow";

type KeyValueLayoutContextValue = {
  isStacked: boolean;
};

const KeyValueLayoutContext =
  React.createContext<KeyValueLayoutContextValue | null>(null);

function useKeyValueLayoutContext(): KeyValueLayoutContextValue {
  const ctx = React.useContext(KeyValueLayoutContext);
  if (!ctx) {
    throw new Error(
      "ResponsiveKeyValueRow must be used inside ResponsiveKeyValueTable",
    );
  }
  return ctx;
}

export type ResponsiveKeyValueTableProps = {
  children: React.ReactNode;
  /** Viewports below this breakpoint use stacked label/value rows instead of a table. */
  stackBelow?: Breakpoint;
  size?: "small" | "medium";
  tableLayout?: "fixed" | "auto";
  /** Merged onto the stacked layout wrapper (narrow viewports). */
  stackContainerSx?: SxProps<Theme>;
};

/**
 * Two-column key/value layout: **table** on wide viewports, **stacked blocks**
 * below `stackBelow`. Use with {@link ResponsiveKeyValueRow}.
 *
 * **Nested key/value blocks** — Place another `ResponsiveKeyValueTable` inside a
 * row’s `children` (each instance has its own layout context). Valid in both modes
 * (inner `table` sits inside a `td` on wide screens). Use a smaller `stackBelow` on
 * the inner table if you want the nested block to stack on more viewports than the
 * outer block (e.g. outer `md`, inner `lg`).
 *
 * @example
 * ```tsx
 * <ResponsiveKeyValueTable>
 *   <ResponsiveKeyValueRow label="Summary">
 *     <ResponsiveKeyValueTable stackBelow="lg" tableLayout="fixed" stackContainerSx={{ px: 0, py: 0 }}>
 *       <ResponsiveKeyValueRow label="Detail A">…</ResponsiveKeyValueRow>
 *     </ResponsiveKeyValueTable>
 *   </ResponsiveKeyValueRow>
 * </ResponsiveKeyValueTable>
 * ```
 */
export function ResponsiveKeyValueTable({
  children,
  stackBelow = "md",
  size = "small",
  tableLayout = "auto",
  stackContainerSx,
}: ResponsiveKeyValueTableProps) {
  const theme = useTheme();
  const isStacked = useMediaQuery(theme.breakpoints.down(stackBelow));
  const value = React.useMemo(() => ({isStacked}), [isStacked]);

  return (
    <KeyValueLayoutContext.Provider value={value}>
      {isStacked ? (
        <Stack
          sx={
            [
              {px: 1.5, py: 0.5},
              ...(stackContainerSx != null ? [stackContainerSx] : []),
            ] as SxProps<Theme>
          }
        >
          {children}
        </Stack>
      ) : (
        <TableContainer sx={{maxWidth: "100%"}}>
          <Table size={size} sx={{tableLayout}}>
            <GeneralTableBody>{children}</GeneralTableBody>
          </Table>
        </TableContainer>
      )}
    </KeyValueLayoutContext.Provider>
  );
}

export type ResponsiveKeyValueRowProps = {
  label: React.ReactNode;
  /** Shown under the label (both stacked and table layouts). */
  description?: React.ReactNode;
  children?: React.ReactNode;
};

export function ResponsiveKeyValueRow({
  label,
  description,
  children,
}: ResponsiveKeyValueRowProps) {
  const {isStacked} = useKeyValueLayoutContext();
  const theme = useTheme();
  const hasDescription =
    description != null &&
    description !== false &&
    !(typeof description === "string" && description.length === 0);

  if (isStacked) {
    return (
      <Box
        sx={{
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          "&:last-child": {borderBottom: "none"},
        }}
      >
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {label}
        </Typography>
        {hasDescription ? (
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{mt: 0.25}}
          >
            {description}
          </Typography>
        ) : null}
        <Box
          sx={{
            mt: hasDescription ? 1 : 0.5,
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
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
          width: "38%",
        }}
      >
        {label}
        {hasDescription ? (
          <Typography
            component="div"
            variant="caption"
            sx={{
              display: "block",
              color: theme.palette.text.secondary,
              mt: 0.5,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </GeneralTableCell>
      <GeneralTableCell
        sx={{
          verticalAlign: "top",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {children}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}
