import React from "react";
import {
  Typography,
  TableCell,
  useTheme,
  Stack,
  TableSortLabel,
  Box,
} from "@mui/material";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";
import SouthIcon from "@mui/icons-material/South";
import TableFilterInput from "./TableFilterInput";

interface FilterableTableHeaderCellProps {
  header: React.ReactNode;
  textAlignRight?: boolean;
  sx?: SxProps<Theme>;
  tooltip?: React.ReactNode;
  sortable?: boolean;
  direction?: "desc" | "asc";
  selectAndSetDirection?: (dir: "desc" | "asc") => void;
  isTableTooltip?: boolean;
  /** Filter value for this column */
  filterValue?: string;
  /** Callback when filter value changes */
  onFilterChange?: (value: string) => void;
  /** Placeholder text for the filter input */
  filterPlaceholder?: string;
  /** Whether filtering is enabled for this column (default: true if onFilterChange provided) */
  filterable?: boolean;
}

/**
 * A table header cell that includes an optional filter input below the header text.
 * Extends GeneralTableHeaderCell with filtering capabilities.
 */
export default function FilterableTableHeaderCell({
  header,
  textAlignRight,
  sx = [],
  tooltip,
  sortable,
  direction,
  selectAndSetDirection,
  isTableTooltip = true,
  filterValue = "",
  onFilterChange,
  filterPlaceholder,
  filterable,
}: FilterableTableHeaderCellProps) {
  const theme = useTheme();
  const tableCellBackgroundColor = "transparent";
  const tableCellTextColor = theme.palette.text.secondary;

  // Determine if we should show filter - either explicitly set or inferred from onFilterChange
  const showFilter = filterable ?? onFilterChange !== undefined;

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
          color: theme.palette.primary.main,
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
      spacing={isTableTooltip ? 0.2 : 1}
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
          paddingBottom: showFilter ? 1 : undefined,
          textAlign: textAlignRight ? "right" : "left",
          background: `${tableCellBackgroundColor}`,
          color: `${tableCellTextColor}`,
          verticalAlign: "bottom",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box>
        {headerContent}
        {showFilter && onFilterChange && (
          <TableFilterInput
            value={filterValue}
            onChange={onFilterChange}
            placeholder={filterPlaceholder}
          />
        )}
      </Box>
    </TableCell>
  );
}
