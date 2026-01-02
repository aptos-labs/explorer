import React from "react";
import {SxProps, TableCell, TableCellProps, Theme} from "@mui/material";

interface GeneralTableCellProps extends TableCellProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

// TODO: use GeneralTableCell for all tables
export default function GeneralTableCell({
  children,
  sx,
  ...props
}: GeneralTableCellProps) {
  return (
    <TableCell
      sx={[
        {
          paddingY: 1.5,
          paddingX: 1.5,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </TableCell>
  );
}
