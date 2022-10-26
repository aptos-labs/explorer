import React from "react";
import {Typography, TableCell, useTheme, Stack} from "@mui/material";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";

interface GeneralTableHeaderCellProps {
  header: React.ReactNode;
  textAlignRight?: boolean;
  sx?: SxProps<Theme>;
  tooltip?: React.ReactNode;
}

export default function GeneralTableHeaderCell({
  header,
  textAlignRight,
  sx = [],
  tooltip,
}: GeneralTableHeaderCellProps) {
  const theme = useTheme();
  const tableCellBackgroundColor = "transparent";
  const tableCellTextColor = theme.palette.text.secondary;

  return (
    <TableCell
      sx={[
        {
          paddingLeft: 1.5,
          paddingRight: tooltip ? 0.5 : 1.5,
          textAlign: textAlignRight ? "right" : "left",
          background: `${tableCellBackgroundColor}`,
          color: `${tableCellTextColor}`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {tooltip ? (
        <Stack
          direction="row"
          spacing={0.2}
          justifyContent={textAlignRight ? "flex-end" : "flex-start"}
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{fontSize: 15}}>
            {header}
          </Typography>
          {tooltip}
        </Stack>
      ) : (
        <Typography variant="subtitle1" sx={{fontSize: 15}}>
          {header}
        </Typography>
      )}
    </TableCell>
  );
}
