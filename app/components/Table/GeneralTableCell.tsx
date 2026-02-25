import {
  type SxProps,
  TableCell,
  type TableCellProps,
  type Theme,
} from "@mui/material";
import type React from "react";
import {memo} from "react";

interface GeneralTableCellProps extends TableCellProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

// Base padding style extracted to avoid recreation on every render
const baseCellStyle = {
  paddingY: 1.5,
  paddingX: 1.5,
} as const;

// Memoized to prevent unnecessary re-renders in large tables
const GeneralTableCell = memo(function GeneralTableCell({
  children,
  sx,
  ...props
}: GeneralTableCellProps) {
  return (
    <TableCell
      sx={[baseCellStyle, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {children}
    </TableCell>
  );
});

export default GeneralTableCell;
