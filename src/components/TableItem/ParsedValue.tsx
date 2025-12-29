import React from "react";
import {Box, Typography, useTheme} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import {Types} from "aptos";
import {formatValueByType, formatKey} from "../../utils/tableItemFormatting";
import {valueToHex} from "../../utils/tableItemParsing";

interface ParsedValueProps {
  value: unknown;
  type?: string;
  abi?: Types.MoveModule | null;
  isKey?: boolean;
}

/**
 * Component to display parsed table item values with fallback to raw hex
 */
export default function ParsedValue({
  value,
  type,
  abi,
  isKey = false,
}: ParsedValueProps) {
  const theme = useTheme();
  const [parseError, setParseError] = React.useState<Error | null>(null);

  // Try to parse and format the value
  let formattedValue: React.ReactNode | null = null;
  try {
    if (isKey) {
      formattedValue = formatKey(value, 0);
    } else {
      formattedValue = formatValueByType(value, type, abi || undefined);
    }
  } catch (error) {
    setParseError(error instanceof Error ? error : new Error(String(error)));
  }

  // If parsing failed or value is unparseable, show warning with raw hex
  if (parseError || formattedValue === null) {
    const rawHex = valueToHex(value);
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: 1,
          borderRadius: 1,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(241, 194, 50, 0.1)"
              : "rgba(241, 194, 50, 0.05)",
          border: `1px solid ${theme.palette.warning.main}`,
        }}
      >
        <WarningIcon
          sx={{
            color: theme.palette.warning.main,
            fontSize: "1.2rem",
          }}
        />
        <Box sx={{flex: 1}}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.warning.main,
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            Unable to parse value
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "monospace",
              color: theme.palette.warning.main,
              wordBreak: "break-all",
            }}
          >
            {rawHex}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Successfully parsed, display formatted value
  return <Box>{formattedValue}</Box>;
}
