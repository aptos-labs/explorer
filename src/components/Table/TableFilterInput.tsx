import React from "react";
import {InputBase, IconButton, Box, useTheme} from "@mui/material";
import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

interface TableFilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * A compact filter input for table column headers.
 * Includes a filter icon and clear button.
 */
export default function TableFilterInput({
  value,
  onChange,
  placeholder = "Filter...",
}: TableFilterInputProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.04)",
        borderRadius: 1,
        px: 0.5,
        py: 0.25,
        mt: 0.5,
        minWidth: 80,
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)"
        }`,
        "&:focus-within": {
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <FilterIcon
        sx={{
          fontSize: 14,
          color: theme.palette.text.secondary,
          mr: 0.5,
          flexShrink: 0,
        }}
      />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          fontSize: 12,
          flex: 1,
          "& .MuiInputBase-input": {
            padding: 0,
            height: 20,
          },
        }}
      />
      {value && (
        <IconButton
          size="small"
          onClick={() => onChange("")}
          sx={{
            padding: 0.25,
            "& .MuiSvgIcon-root": {
              fontSize: 14,
            },
          }}
        >
          <ClearIcon />
        </IconButton>
      )}
    </Box>
  );
}
