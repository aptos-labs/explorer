import React from "react";
import {
  Box,
  Stack,
  Typography,
  useTheme,
  Chip,
  Tooltip,
  alpha,
  Grid,
  CircularProgress,
} from "@mui/material";
import HashButton, {HashType} from "../../../../components/HashButton";
import ContentBox from "../../../../components/IndividualPageContent/ContentBox";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";
import {isValidAccountAddress} from "../../../utils";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {useGetStructInfo} from "../../../../api/hooks/useGetStructInfo";

// Check if a value looks like a valid hex address
function isLikelyAddress(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("0x") &&
    isValidAccountAddress(value)
  );
}

// Check if a value looks like a number/amount
function isLikelyAmount(value: unknown): boolean {
  if (typeof value === "number") return true;
  if (typeof value === "string") {
    return /^\d+$/.test(value);
  }
  return false;
}

// Check if a value is a boolean
function isBooleanValue(value: unknown): value is boolean {
  return typeof value === "boolean" || value === "true" || value === "false";
}

// Get a user-friendly type name
function getFriendlyTypeName(type: string): string {
  if (type === "address") return "Address";
  if (type === "bool") return "Boolean";
  if (type === "u8") return "u8";
  if (type === "u16") return "u16";
  if (type === "u32") return "u32";
  if (type === "u64") return "u64";
  if (type === "u128") return "u128";
  if (type === "u256") return "u256";
  if (type === "0x1::string::String") return "String";
  if (type.startsWith("vector<u8>")) return "Bytes";
  if (type.startsWith("vector<")) {
    const inner = type.slice(7, -1);
    return `Vec<${getFriendlyTypeName(inner)}>`;
  }
  if (type.startsWith("0x1::option::Option<")) {
    const inner = type.slice(20, -1);
    return `Option<${getFriendlyTypeName(inner)}>`;
  }
  // Return shortened version for complex types
  if (type.includes("::")) {
    const parts = type.split("::");
    return parts[parts.length - 1];
  }
  return type;
}

// Render a single field value
function FieldValue({value}: {value: unknown}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  // Handle null/undefined
  if (value === null || value === undefined) {
    return (
      <Typography
        variant="body2"
        sx={{color: theme.palette.text.secondary, fontStyle: "italic"}}
      >
        null
      </Typography>
    );
  }

  // Handle addresses
  if (isLikelyAddress(value)) {
    return <HashButton hash={value} type={HashType.ACCOUNT} size="small" />;
  }

  // Handle booleans
  if (isBooleanValue(value)) {
    const boolStr = String(value);
    return (
      <Chip
        label={boolStr}
        size="small"
        color={boolStr === "true" ? "success" : "default"}
        sx={{
          fontFamily: "monospace",
          fontSize: "0.8rem",
        }}
      />
    );
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Typography
          variant="body2"
          sx={{color: theme.palette.text.secondary, fontStyle: "italic"}}
        >
          empty array
        </Typography>
      );
    }

    // Check if it's an array of hex bytes (like 0x00, 0x01, etc.)
    const isByteArray = value.every(
      (v) =>
        typeof v === "number" ||
        (typeof v === "string" && /^(0x)?[0-9a-fA-F]+$/.test(v)),
    );

    if (isByteArray && value.length > 10) {
      return (
        <Box
          sx={{
            backgroundColor: semanticColors.codeBlock.background,
            padding: "4px 8px",
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.75rem",
            wordBreak: "break-all",
            maxWidth: "100%",
          }}
        >
          [{value.length} bytes]
        </Box>
      );
    }

    return (
      <Stack spacing={0.5}>
        {value.map((item, i) => (
          <Box key={i} sx={{display: "flex", alignItems: "center", gap: 1}}>
            <Typography
              variant="caption"
              sx={{color: theme.palette.text.secondary, minWidth: 20}}
            >
              [{i}]
            </Typography>
            <FieldValue value={item} />
          </Box>
        ))}
      </Stack>
    );
  }

  // Handle objects (nested structs)
  if (typeof value === "object") {
    const entries = Object.entries(value);
    return (
      <Stack spacing={0.5} sx={{pl: 1}}>
        {entries.map(([key, val], i) => (
          <Box key={i} sx={{display: "flex", alignItems: "flex-start", gap: 1}}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                minWidth: "fit-content",
                fontFamily: "monospace",
              }}
            >
              {key}:
            </Typography>
            <FieldValue value={val} />
          </Box>
        ))}
      </Stack>
    );
  }

  // Handle numbers/amounts - format with commas
  if (isLikelyAmount(value)) {
    const numStr = String(value);
    const formatted = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (
      <Box
        sx={{
          backgroundColor: semanticColors.codeBlock.background,
          padding: "2px 8px",
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.8rem",
        }}
      >
        {formatted}
      </Box>
    );
  }

  // Default string display
  return (
    <Box
      sx={{
        backgroundColor: semanticColors.codeBlock.background,
        padding: "2px 8px",
        borderRadius: 1,
        fontFamily: "monospace",
        fontSize: "0.8rem",
        wordBreak: "break-all",
        maxWidth: "100%",
      }}
    >
      {String(value)}
    </Box>
  );
}

// Field row component with name, type, and value
function FieldRow({
  name,
  type,
  value,
}: {
  name: string;
  type: string | null;
  value: unknown;
}) {
  const theme = useTheme();
  const friendlyType = type ? getFriendlyTypeName(type) : null;

  return (
    <Grid container spacing={1} alignItems="flex-start">
      <Grid size={{xs: 12, sm: 3}}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={name}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              fontSize: "0.75rem",
              fontWeight: 500,
              maxWidth: "100%",
            }}
          />
          {type && (
            <Tooltip title={type} placement="top" arrow>
              <Chip
                label={friendlyType}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  color: theme.palette.text.secondary,
                  borderColor: alpha(theme.palette.text.secondary, 0.3),
                }}
              />
            </Tooltip>
          )}
        </Box>
      </Grid>
      <Grid size={{xs: 12, sm: 9}}>
        <Box sx={{maxWidth: "100%", overflow: "hidden"}}>
          <FieldValue value={value} />
        </Box>
      </Grid>
    </Grid>
  );
}

type IdentifiedEventDataProps = {
  eventType: string;
  data: Record<string, unknown>;
};

export default function IdentifiedEventData({
  eventType,
  data,
}: IdentifiedEventDataProps) {
  const theme = useTheme();

  // Fetch struct info (field names and types) from ABI
  const {data: structInfo, isLoading: structInfoLoading} =
    useGetStructInfo(eventType);

  const fields = structInfo?.fields ?? [];
  const dataEntries = Object.entries(data);

  // If we have no data entries, show nothing
  if (dataEntries.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{color: theme.palette.text.secondary, fontStyle: "italic"}}
      >
        No data
      </Typography>
    );
  }

  return (
    <ContentBox padding={1.5}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1.5}}>
        <Typography
          variant="subtitle2"
          sx={{color: theme.palette.text.secondary}}
        >
          Event Data
        </Typography>
        {structInfoLoading && <CircularProgress size={14} />}
        {fields.length > 0 && (
          <Tooltip title="Field names and types recovered from ABI">
            <InfoOutlinedIcon
              sx={{
                fontSize: 16,
                color: theme.palette.success.main,
                opacity: 0.7,
              }}
            />
          </Tooltip>
        )}
      </Stack>
      <Stack spacing={1.5}>
        {dataEntries.map(([key, value], i) => {
          // Find the matching field from struct info
          const fieldInfo = fields.find((f) => f.name === key);
          return (
            <FieldRow
              key={i}
              name={key}
              type={fieldInfo?.type ?? null}
              value={value}
            />
          );
        })}
      </Stack>
    </ContentBox>
  );
}

// Check if event data can be displayed with the identified format
export function canDisplayIdentifiedEventData(
  data: unknown,
): data is Record<string, unknown> {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Object.keys(data).length > 0
  );
}
