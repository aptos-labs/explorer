import React from "react";
import {Typography, TableCell, useTheme} from "@mui/material";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";

interface GeneralTableHeaderCellProps {
  header: React.ReactNode;
  textAlignRight?: boolean;
  sx?: SxProps<Theme>;
}

export default function GeneralTableHeaderCell({
  header,
  textAlignRight,
  sx = [],
}: GeneralTableHeaderCellProps) {
  const theme = useTheme();
  const tableCellBackgroundColor = "transparent";
  const tableCellTextColor = theme.palette.text.secondary;

  return (
    <TableCell
      sx={[
        {
          textAlign: textAlignRight ? "right" : "left",
          background: `${tableCellBackgroundColor}`,
          color: `${tableCellTextColor}`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography variant="subtitle1">{header}</Typography>
    </TableCell>
  );
}
