import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";
import {useCallback, useEffect, useState} from "react";

type FunctionFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function FunctionFilter({
  value,
  onChange,
  placeholder = "Filter by function (e.g. 0x1::coin::transfer)",
}: FunctionFilterProps) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = useCallback(() => {
    onChange(inputValue.trim());
  }, [inputValue, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange("");
  }, [onChange]);

  return (
    <TextField
      size="small"
      fullWidth
      aria-label="Filter transactions by function"
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleSubmit}
      variant="outlined"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip title="Filter by entry function ID (press Enter to apply)">
                <FilterListIcon
                  sx={{fontSize: 20, color: theme.palette.text.secondary}}
                />
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: inputValue ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="Clear filter"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon sx={{fontSize: 18}} />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: {
            fontFamily: "monospace",
            fontSize: "0.875rem",
          },
        },
      }}
      sx={{
        maxWidth: 480,
        "& .MuiOutlinedInput-root": {
          borderRadius: 1.5,
        },
      }}
    />
  );
}
