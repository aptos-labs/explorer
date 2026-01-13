import React from "react";
import {
  Box,
  Stack,
  Typography,
  useTheme,
  Chip,
  Divider,
  alpha,
  Grid,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {Types} from "aptos";
import HashButton, {HashType} from "../../../../components/HashButton";
import {Link} from "../../../../routing";
import ContentBox from "../../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";
import {isValidAccountAddress} from "../../../utils";
import FunctionsIcon from "@mui/icons-material/Functions";
import CategoryIcon from "@mui/icons-material/Category";
import DataArrayIcon from "@mui/icons-material/DataArray";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {useGetFunctionInfo} from "../../../../api/hooks/useGetFunctionInfo";

// Type guard for entry function payload
function isEntryFunctionPayload(
  payload: Types.TransactionPayload,
): payload is Types.TransactionPayload_EntryFunctionPayload {
  return payload.type === "entry_function_payload";
}

// Type guard for multisig payload
function isMultisigPayload(
  payload: Types.TransactionPayload,
): payload is Types.TransactionPayload_MultisigPayload {
  return payload.type === "multisig_payload";
}

// Type guard for script payload
function isScriptPayload(
  payload: Types.TransactionPayload,
): payload is Types.TransactionPayload_ScriptPayload {
  return payload.type === "script_payload";
}

// Extract function info from payload
function extractFunctionInfo(payload: Types.TransactionPayload): {
  functionFullStr: string | null;
  address: string | null;
  moduleName: string | null;
  functionName: string | null;
  typeArguments: string[];
  functionArguments: unknown[];
} {
  let functionFullStr: string | null = null;
  let typeArguments: string[] = [];
  let functionArguments: unknown[] = [];

  if (isEntryFunctionPayload(payload)) {
    functionFullStr = payload.function;
    typeArguments = payload.type_arguments || [];
    functionArguments = payload.arguments || [];
  } else if (isMultisigPayload(payload)) {
    const txPayload = payload.transaction_payload;
    if (txPayload && "function" in txPayload) {
      functionFullStr = txPayload.function;
      typeArguments = txPayload.type_arguments || [];
      functionArguments = txPayload.arguments || [];
    }
  }

  if (!functionFullStr) {
    return {
      functionFullStr: null,
      address: null,
      moduleName: null,
      functionName: null,
      typeArguments,
      functionArguments,
    };
  }

  const parts = functionFullStr.split("::");
  return {
    functionFullStr,
    address: parts[0] || null,
    moduleName: parts[1] || null,
    functionName: parts[2] || null,
    typeArguments,
    functionArguments,
  };
}

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

// Render a single argument value
function ArgumentValue({value}: {value: unknown}) {
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
            <ArgumentValue value={item} />
          </Box>
        ))}
      </Stack>
    );
  }

  // Handle objects
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
              }}
            >
              {key}:
            </Typography>
            <ArgumentValue value={val} />
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

// Type argument label component
function TypeArgumentLabel({typeArg}: {typeArg: string}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  // Try to extract the display name (last part of the type)
  const parts = typeArg.split("::");
  const displayName = parts.length >= 3 ? parts[2] : typeArg;
  const modulePath = parts.length >= 2 ? `${parts[0]}::${parts[1]}` : "";

  // Check if it's a common known type
  const isAptosCoin = typeArg === "0x1::aptos_coin::AptosCoin";

  if (isAptosCoin) {
    return (
      <Chip
        label="APT"
        size="small"
        sx={{
          backgroundColor: semanticColors.codeBlock.background,
          fontFamily: "monospace",
          fontSize: "0.75rem",
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        backgroundColor: semanticColors.codeBlock.background,
        padding: "2px 8px",
        borderRadius: 1,
        fontFamily: "monospace",
        fontSize: "0.75rem",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {modulePath && (
        <Typography
          variant="caption"
          sx={{color: theme.palette.text.secondary, fontSize: "0.7rem"}}
        >
          {modulePath}::
        </Typography>
      )}
      <Typography variant="caption" sx={{fontSize: "0.75rem"}}>
        {displayName}
      </Typography>
    </Box>
  );
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

// Argument row component with name, type, and value
function ArgumentRow({
  index,
  name,
  type,
  value,
}: {
  index: number;
  name: string | null;
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
          {name ? (
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
          ) : (
            <Chip
              label={`arg${index}`}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            />
          )}
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
          <ArgumentValue value={value} />
        </Box>
      </Grid>
    </Grid>
  );
}

type IdentifiedPayloadCardProps = {
  payload: Types.TransactionPayload;
};

export default function IdentifiedPayloadCard({
  payload,
}: IdentifiedPayloadCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  const {
    functionFullStr,
    address,
    moduleName,
    functionName,
    typeArguments,
    functionArguments,
  } = extractFunctionInfo(payload);

  // Fetch function info (parameter names and types) from ABI/source
  const {data: functionInfo, isLoading: functionInfoLoading} =
    useGetFunctionInfo(functionFullStr);

  // For script payloads
  if (isScriptPayload(payload)) {
    return (
      <ContentBox>
        <ContentRow
          title="Payload Type:"
          value={
            <Chip
              label="Script"
              size="small"
              sx={{
                backgroundColor: semanticColors.codeBlock.background,
              }}
            />
          }
        />
        {payload.type_arguments && payload.type_arguments.length > 0 && (
          <ContentRow
            title="Type Arguments:"
            value={
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                useFlexGap
                sx={{gap: 0.5}}
              >
                {payload.type_arguments.map((typeArg, i) => (
                  <TypeArgumentLabel key={i} typeArg={typeArg} />
                ))}
              </Stack>
            }
          />
        )}
        {payload.arguments && payload.arguments.length > 0 && (
          <ContentRow
            title="Arguments:"
            value={
              <Stack spacing={1} sx={{width: "100%"}}>
                {payload.arguments.map((arg, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={`arg${i}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        fontSize: "0.7rem",
                        minWidth: 50,
                      }}
                    />
                    <Box sx={{flex: 1, minWidth: 0}}>
                      <ArgumentValue value={arg} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            }
          />
        )}
      </ContentBox>
    );
  }

  // If we couldn't extract function info, return null (fallback to JSON)
  if (!functionFullStr || !address || !moduleName || !functionName) {
    return null;
  }

  // For multisig payloads, show additional info
  const isMultisig = isMultisigPayload(payload);
  const multisigAddress = isMultisig ? payload.multisig_address : null;

  // Get parameter info from fetched function data
  const params = functionInfo?.params ?? [];
  const typeParamNames = functionInfo?.typeParamNames ?? null;

  return (
    <ContentBox>
      {isMultisig && multisigAddress && (
        <ContentRow
          title="Multisig Account:"
          value={<HashButton hash={multisigAddress} type={HashType.ACCOUNT} />}
        />
      )}
      <ContentRow
        title="Function:"
        value={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <FunctionsIcon
              sx={{fontSize: 18, color: theme.palette.text.secondary}}
            />
            <Link
              to={`/account/${address}/modules/code/${moduleName}/${functionName}`}
              sx={{
                backgroundColor: semanticColors.codeBlock.background,
                "&:hover": {
                  backgroundColor: semanticColors.codeBlock.backgroundHover,
                },
                color: theme.palette.primary.main,
                padding: "4px 12px",
                borderRadius: 1,
                textDecoration: "none",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                display: "inline-block",
              }}
            >
              {moduleName}::{functionName}
            </Link>
          </Box>
        }
      />
      <ContentRow
        title="Contract Address:"
        value={<HashButton hash={address} type={HashType.ACCOUNT} />}
      />
      {typeArguments.length > 0 && (
        <ContentRow
          title="Type Arguments:"
          value={
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <CategoryIcon
                sx={{fontSize: 18, color: theme.palette.text.secondary}}
              />
              <Stack
                direction="row"
                spacing={0.5}
                flexWrap="wrap"
                useFlexGap
                sx={{gap: 0.5}}
              >
                {typeArguments.map((typeArg, i) => (
                  <Box
                    key={i}
                    sx={{display: "flex", alignItems: "center", gap: 0.5}}
                  >
                    {typeParamNames?.[i] && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                        }}
                      >
                        {typeParamNames[i]}:
                      </Typography>
                    )}
                    <TypeArgumentLabel typeArg={typeArg} />
                  </Box>
                ))}
              </Stack>
            </Box>
          }
        />
      )}
      {functionArguments.length > 0 && (
        <>
          <Divider sx={{my: 1}} />
          <Box sx={{mb: 1}}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
              <DataArrayIcon
                sx={{fontSize: 18, color: theme.palette.text.secondary}}
              />
              <Typography
                variant="subtitle2"
                sx={{color: theme.palette.text.secondary}}
              >
                Arguments ({functionArguments.length})
              </Typography>
              {functionInfoLoading && <CircularProgress size={14} />}
              {functionInfo?.paramNames && (
                <Tooltip title="Parameter names recovered from source code">
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
          </Box>
          <Stack spacing={1.5}>
            {functionArguments.map((arg, i) => (
              <ArgumentRow
                key={i}
                index={i}
                name={params[i]?.name ?? null}
                type={params[i]?.type ?? null}
                value={arg}
              />
            ))}
          </Stack>
        </>
      )}
    </ContentBox>
  );
}

// Helper to check if a payload can be displayed with the identified card
export function canDisplayIdentifiedPayload(
  payload: Types.TransactionPayload,
): boolean {
  if (isScriptPayload(payload)) {
    return true;
  }

  const {functionFullStr} = extractFunctionInfo(payload);
  return functionFullStr !== null;
}
