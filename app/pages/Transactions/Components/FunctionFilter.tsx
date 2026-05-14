import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type {KeyboardEvent} from "react";
import {useCallback, useRef, useState} from "react";
import type {FunctionFilterParams} from "../../../api/hooks/useFunctionFilter";

type FunctionFilterProps = {
  value: FunctionFilterParams;
  onChange: (field: keyof FunctionFilterParams, value: string) => void;
  onClear: () => void;
  isFilterActive: boolean;
};

type FieldConfig = {
  key: keyof FunctionFilterParams;
  label: string;
  placeholder: string;
  ariaLabel: string;
  disabledHint: string;
  flex: number;
};

const FIELDS: FieldConfig[] = [
  {
    key: "address",
    label: "Contract Address",
    placeholder: "0x1",
    ariaLabel: "Filter by contract address",
    disabledHint: "",
    flex: 2,
  },
  {
    key: "module",
    label: "Module",
    placeholder: "coin",
    ariaLabel: "Filter by module name",
    disabledHint: "Set a contract address first",
    flex: 1,
  },
  {
    key: "functionName",
    label: "Function",
    placeholder: "transfer",
    ariaLabel: "Filter by function name",
    disabledHint: "Set a module name first",
    flex: 1,
  },
];

function FilterField({
  config,
  inputValue,
  disabled,
  onInputChange,
  onSubmit,
}: {
  config: FieldConfig;
  inputValue: string;
  disabled: boolean;
  onInputChange: (key: keyof FunctionFilterParams, value: string) => void;
  onSubmit: (key: keyof FunctionFilterParams) => void;
}) {
  const theme = useTheme();
  const isClearing = useRef(false);

  const handleCommit = useCallback(() => {
    if (disabled) return;
    onSubmit(config.key);
  }, [onSubmit, config.key, disabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCommit();
      }
    },
    [handleCommit],
  );

  const handleBlur = useCallback(() => {
    if (isClearing.current) {
      isClearing.current = false;
      return;
    }
    handleCommit();
  }, [handleCommit]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    isClearing.current = true;
    onInputChange(config.key, "");
    onSubmit(config.key);
  }, [onInputChange, onSubmit, config.key, disabled]);

  const displayValue = disabled ? "" : inputValue;

  const field = (
    <TextField
      size="small"
      fullWidth
      disabled={disabled}
      label={config.label}
      aria-label={config.ariaLabel}
      placeholder={disabled ? "" : config.placeholder}
      value={displayValue}
      onChange={(e) => onInputChange(config.key, e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      variant="outlined"
      slotProps={{
        input: {
          endAdornment: displayValue ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={`Clear ${config.label.toLowerCase()}`}
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
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
        inputLabel: {
          sx: {
            fontSize: "0.8rem",
            color: theme.palette.text.secondary,
          },
        },
      }}
      sx={{
        flex: config.flex,
        minWidth: 120,
        "& .MuiOutlinedInput-root": {
          borderRadius: 1.5,
        },
      }}
    />
  );

  if (disabled && config.disabledHint) {
    return (
      <Tooltip title={config.disabledHint}>
        <Box sx={{flex: config.flex, minWidth: 120}}>{field}</Box>
      </Tooltip>
    );
  }

  return field;
}

export default function FunctionFilter({
  value,
  onChange,
  onClear,
  isFilterActive,
}: FunctionFilterProps) {
  const theme = useTheme();

  const [localValues, setLocalValues] = useState<FunctionFilterParams>({
    address: value.address,
    module: value.module,
    functionName: value.functionName,
  });

  // Sync local state when committed values change externally.
  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    const next = {...localValues};
    let changed = false;
    for (const k of ["address", "module", "functionName"] as const) {
      if (prevValue.current[k] !== value[k]) {
        next[k] = value[k];
        changed = true;
      }
    }
    prevValue.current = value;
    if (changed) {
      setLocalValues(next);
    }
  }

  const handleInputChange = useCallback(
    (key: keyof FunctionFilterParams, val: string) => {
      setLocalValues((prev) => {
        const next = {...prev, [key]: val};
        // Cascade clear: if address is emptied, clear module+function;
        // if module is emptied, clear function.
        if (key === "address" && val.trim() === "") {
          next.module = "";
          next.functionName = "";
        } else if (key === "module" && val.trim() === "") {
          next.functionName = "";
        }
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    (key: keyof FunctionFilterParams) => {
      setLocalValues((prev) => {
        const trimmed = prev[key].trim();
        if (trimmed !== value[key]) {
          onChange(key, trimmed);
        }
        return {...prev, [key]: trimmed};
      });
    },
    [onChange, value],
  );

  const moduleDisabled = localValues.address.trim() === "";
  const functionDisabled = moduleDisabled || localValues.module.trim() === "";

  const disabledState: Record<keyof FunctionFilterParams, boolean> = {
    address: false,
    module: moduleDisabled,
    functionName: functionDisabled,
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          mb: 1,
        }}
      >
        <Tooltip title="Filter transactions by entry function fields (press Enter or Tab to apply each field)">
          <FilterListIcon
            sx={{fontSize: 20, color: theme.palette.text.secondary}}
          />
        </Tooltip>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Filter by Entry Function
        </Typography>
        {isFilterActive && (
          <Chip
            label="Clear all"
            size="small"
            onDelete={onClear}
            deleteIcon={<ClearIcon />}
            variant="outlined"
            sx={{ml: 1}}
          />
        )}
      </Stack>
      <Stack
        direction={{xs: "column", sm: "row"}}
        spacing={1.5}
        sx={{
          alignItems: "flex-start",
        }}
      >
        {FIELDS.map((field) => (
          <FilterField
            key={field.key}
            config={field}
            inputValue={localValues[field.key]}
            disabled={disabledState[field.key]}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        ))}
      </Stack>
    </Box>
  );
}
