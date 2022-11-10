import React from "react";
import {
  Typography,
  TableCell,
  useTheme,
  Stack,
  TableSortLabel,
} from "@mui/material";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";
import SouthIcon from "@mui/icons-material/South";
import {aptosColor} from "../../themes/colors/aptosColorPalette";

interface GeneralTableHeaderCellProps {
  header: React.ReactNode;
  textAlignRight?: boolean;
  sx?: SxProps<Theme>;
  tooltip?: React.ReactNode;
  sortable?: boolean;
  direction?: "desc" | "asc";
  selectAndSetDirection?: (dir: "desc" | "asc") => void;
}

export default function GeneralTableHeaderCell({
  header,
  textAlignRight,
  sx = [],
  tooltip,
  sortable,
  direction,
  selectAndSetDirection,
}: GeneralTableHeaderCellProps) {
  const theme = useTheme();
  const tableCellBackgroundColor = "transparent";
  const tableCellTextColor = theme.palette.text.secondary;

  const toggleDirection = () => {
    if (selectAndSetDirection === undefined) {
      return;
    }
    selectAndSetDirection(direction === "desc" ? "asc" : "desc");
  };

  const headerTextComponent = (
    <Typography variant="subtitle1" sx={{fontSize: 15, lineHeight: "inherit"}}>
      {header}
    </Typography>
  );

  const headerSortLabel = sortable ? (
    <TableSortLabel
      active={direction !== undefined}
      direction={direction === undefined ? "desc" : direction}
      onClick={toggleDirection}
      IconComponent={SouthIcon}
      sx={{
        "&.MuiTableSortLabel-root .MuiTableSortLabel-icon": {
          marginLeft: 0,
          marginRight: 0.5,
          color: aptosColor,
        },
        flexDirection: "row-reverse",
      }}
    >
      {headerTextComponent}
    </TableSortLabel>
  ) : (
    headerTextComponent
  );

  const headerContent = tooltip ? (
    <Stack
      direction="row"
      spacing={0.2}
      justifyContent={textAlignRight ? "flex-end" : "flex-start"}
      alignItems="center"
    >
      {headerSortLabel}
      {tooltip}
    </Stack>
  ) : (
    headerSortLabel
  );

  return (
    <TableCell
      sx={[
        {
          paddingLeft: tooltip ? 0.5 : 1.5,
          paddingRight: 1.5,
          textAlign: textAlignRight ? "right" : "left",
          background: `${tableCellBackgroundColor}`,
          color: `${tableCellTextColor}`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {headerContent}
    </TableCell>
  );
}
