import React from "react";
import {
  Box,
  Stack,
  Typography,
  useTheme,
  Chip,
  Divider,
  alpha,
} from "@mui/material";
import {Types} from "aptos";
import HashButton, {HashType} from "../../../../components/HashButton";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import {getSemanticColors} from "../../../../themes/colors/aptosBrandColors";
import {isValidAccountAddress} from "../../../utils";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StorageIcon from "@mui/icons-material/Storage";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
  collectionV2Address,
  objectCoreResource,
  tokenV2Address,
} from "../../../../constants";

// Get a readable label for the change type
function getChangeTypeLabel(type: string): {
  label: string;
  icon: React.ReactNode;
  color: string;
} {
  switch (type) {
    case "write_resource":
      return {
        label: "Write Resource",
        icon: <EditIcon sx={{fontSize: 16}} />,
        color: "info",
      };
    case "create_resource":
      return {
        label: "Create Resource",
        icon: <AddCircleOutlineIcon sx={{fontSize: 16}} />,
        color: "success",
      };
    case "delete_resource":
      return {
        label: "Delete Resource",
        icon: <DeleteOutlineIcon sx={{fontSize: 16}} />,
        color: "error",
      };
    case "write_module":
      return {
        label: "Write Module",
        icon: <StorageIcon sx={{fontSize: 16}} />,
        color: "info",
      };
    case "delete_module":
      return {
        label: "Delete Module",
        icon: <DeleteOutlineIcon sx={{fontSize: 16}} />,
        color: "error",
      };
    case "write_table_item":
      return {
        label: "Write Table Item",
        icon: <TableChartIcon sx={{fontSize: 16}} />,
        color: "info",
      };
    case "delete_table_item":
      return {
        label: "Delete Table Item",
        icon: <DeleteOutlineIcon sx={{fontSize: 16}} />,
        color: "error",
      };
    default:
      return {
        label: type,
        icon: <StorageIcon sx={{fontSize: 16}} />,
        color: "default",
      };
  }
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

// Format resource type for display
function formatResourceType(resourceType: string): {
  modulePath: string;
  resourceName: string;
  typeArgs: string[];
} {
  // Handle generic types like "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
  const genericMatch = resourceType.match(/^([^<]+)(?:<(.+)>)?$/);
  if (!genericMatch) {
    return {modulePath: "", resourceName: resourceType, typeArgs: []};
  }

  const basePath = genericMatch[1];
  const typeArgsStr = genericMatch[2];

  const parts = basePath.split("::");
  const resourceName = parts.length >= 3 ? parts[2] : basePath;
  const modulePath = parts.length >= 2 ? `${parts[0]}::${parts[1]}` : "";

  const typeArgs = typeArgsStr ? parseTypeArgs(typeArgsStr) : [];

  return {modulePath, resourceName, typeArgs};
}

// Parse type arguments (handles nested generics)
function parseTypeArgs(typeArgsStr: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < typeArgsStr.length; i++) {
    const char = typeArgsStr[i];
    if (char === "<") {
      depth++;
      current += char;
    } else if (char === ">") {
      depth--;
      current += char;
    } else if (char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}

// Get short name from type argument
function getShortTypeName(typeArg: string): string {
  // Extract the last part of the type for display
  const parts = typeArg.split("::");
  return parts[parts.length - 1]?.replace(/>+$/, "") || typeArg;
}

// Render a data value with smart formatting
function DataValue({value, depth = 0}: {value: unknown; depth?: number}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);

  // Limit depth to prevent infinite recursion
  if (depth > 4) {
    return (
      <Typography
        variant="body2"
        sx={{color: theme.palette.text.secondary, fontStyle: "italic"}}
      >
        [nested data...]
      </Typography>
    );
  }

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
  if (typeof value === "boolean" || value === "true" || value === "false") {
    const boolStr = String(value);
    return (
      <Chip
        label={boolStr}
        size="small"
        color={boolStr === "true" ? "success" : "default"}
        sx={{
          fontFamily: "monospace",
          fontSize: "0.75rem",
          height: 24,
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
          []
        </Typography>
      );
    }

    // For large arrays, show summary
    if (value.length > 5) {
      return (
        <Box
          sx={{
            backgroundColor: semanticColors.codeBlock.background,
            padding: "4px 8px",
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.75rem",
          }}
        >
          [{value.length} items]
        </Box>
      );
    }

    return (
      <Stack spacing={0.5}>
        {value.map((item, i) => (
          <Box key={i} sx={{display: "flex", alignItems: "flex-start", gap: 1}}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                minWidth: 20,
                fontFamily: "monospace",
              }}
            >
              [{i}]
            </Typography>
            <DataValue value={item} depth={depth + 1} />
          </Box>
        ))}
      </Stack>
    );
  }

  // Handle objects
  if (typeof value === "object") {
    const entries = Object.entries(value);

    // Special handling for common patterns
    // inner: { addr } pattern (common in Aptos resources)
    if (
      entries.length === 1 &&
      entries[0][0] === "inner" &&
      isLikelyAddress((entries[0][1] as Record<string, unknown>)?.inner)
    ) {
      const innerAddr = (entries[0][1] as Record<string, string>).inner;
      return (
        <HashButton hash={innerAddr} type={HashType.ACCOUNT} size="small" />
      );
    }

    // For objects with inner address directly
    if (
      "inner" in value &&
      isLikelyAddress((value as Record<string, unknown>).inner)
    ) {
      return (
        <HashButton
          hash={(value as Record<string, string>).inner}
          type={HashType.ACCOUNT}
          size="small"
        />
      );
    }

    // For very large objects, collapse
    if (entries.length > 10) {
      return (
        <Box
          sx={{
            backgroundColor: semanticColors.codeBlock.background,
            padding: "4px 8px",
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.75rem",
          }}
        >
          {`{${entries.length} fields}`}
        </Box>
      );
    }

    return (
      <Stack spacing={0.5} sx={{pl: depth > 0 ? 1 : 0}}>
        {entries.map(([key, val], i) => (
          <Box key={i} sx={{display: "flex", alignItems: "flex-start", gap: 1}}>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                minWidth: "fit-content",
                fontFamily: "monospace",
                fontSize: "0.75rem",
              }}
            >
              {key}:
            </Typography>
            <Box sx={{flex: 1, minWidth: 0}}>
              <DataValue value={val} depth={depth + 1} />
            </Box>
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
          fontSize: "0.75rem",
        }}
      >
        {formatted}
      </Box>
    );
  }

  // Default string display
  const strValue = String(value);
  const isLong = strValue.length > 80;

  return (
    <Box
      sx={{
        backgroundColor: semanticColors.codeBlock.background,
        padding: "2px 8px",
        borderRadius: 1,
        fontFamily: "monospace",
        fontSize: "0.75rem",
        wordBreak: "break-all",
        maxWidth: "100%",
      }}
    >
      {isLong ? `${strValue.slice(0, 80)}...` : strValue}
    </Box>
  );
}

// Resource type display component
function ResourceTypeLabel({resourceType}: {resourceType: string}) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const {modulePath, resourceName, typeArgs} = formatResourceType(resourceType);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
      }}
    >
      <Box
        sx={{
          backgroundColor: semanticColors.codeBlock.background,
          padding: "2px 8px",
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.75rem",
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {modulePath && (
          <Typography
            component="span"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.7rem",
            }}
          >
            {modulePath}::
          </Typography>
        )}
        <Typography
          component="span"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {resourceName}
        </Typography>
      </Box>
      {typeArgs.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {typeArgs.map((typeArg, i) => (
            <Chip
              key={i}
              label={getShortTypeName(typeArg)}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

type IdentifiedChangeCardProps = {
  change: Types.WriteSetChange;
  index: number;
};

export default function IdentifiedChangeCard({
  change,
  index,
}: IdentifiedChangeCardProps) {
  const theme = useTheme();
  const semanticColors = getSemanticColors(theme.palette.mode);
  const {label, icon, color} = getChangeTypeLabel(change.type);

  // Determine address type for HashButton
  const isObjectAddress =
    "data" in change &&
    change.data &&
    "type" in change.data &&
    [objectCoreResource, tokenV2Address, collectionV2Address].includes(
      change.data.type,
    );

  // Extract resource data if available
  const hasData =
    "data" in change && change.data && typeof change.data === "object";
  const changeData = hasData
    ? (change.data as {type?: string; data?: unknown})
    : null;
  const resourceType = changeData?.type ?? null;
  const resourceData = changeData?.data ?? null;

  return (
    <Stack spacing={1.5}>
      {/* Header row with change type and index */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Chip
          icon={icon as React.ReactElement}
          label={label}
          size="small"
          color={color as "default" | "info" | "success" | "error"}
          variant="outlined"
          sx={{
            fontWeight: 500,
          }}
        />
        <Typography
          variant="caption"
          sx={{color: theme.palette.text.secondary}}
        >
          Change #{index}
        </Typography>
      </Box>

      {/* Address row */}
      {"address" in change && change.address && (
        <ContentRow
          title="Address:"
          value={
            <HashButton
              hash={change.address}
              type={isObjectAddress ? HashType.OBJECT : HashType.ACCOUNT}
              size="small"
            />
          }
        />
      )}

      {/* Resource type row */}
      {resourceType && (
        <ContentRow
          title="Resource:"
          value={<ResourceTypeLabel resourceType={resourceType} />}
        />
      )}

      {/* State key hash (truncated) */}
      <ContentRow
        title="State Key:"
        value={
          <Box
            sx={{
              backgroundColor: semanticColors.codeBlock.background,
              padding: "2px 8px",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: theme.palette.text.secondary,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {change.state_key_hash.slice(0, 20)}...
            {change.state_key_hash.slice(-8)}
          </Box>
        }
      />

      {/* Resource data section */}
      {resourceData && typeof resourceData === "object" && (
        <>
          <Divider sx={{my: 0.5}} />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 1,
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              Resource Data
            </Typography>
            <Box
              sx={{
                backgroundColor: alpha(
                  semanticColors.codeBlock.background,
                  0.5,
                ),
                borderRadius: 1,
                padding: 1.5,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              <DataValue value={resourceData} />
            </Box>
          </Box>
        </>
      )}

      {/* Table item fields */}
      {"handle" in change && change.handle && (
        <ContentRow
          title="Handle:"
          value={
            <Box
              sx={{
                backgroundColor: semanticColors.codeBlock.background,
                padding: "2px 8px",
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.7rem",
                wordBreak: "break-all",
              }}
            >
              {change.handle}
            </Box>
          }
        />
      )}
      {"key" in change && change.key && (
        <ContentRow
          title="Key:"
          value={
            <Box
              sx={{
                backgroundColor: semanticColors.codeBlock.background,
                padding: "2px 8px",
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.7rem",
                wordBreak: "break-all",
              }}
            >
              {String(change.key).length > 100
                ? `${String(change.key).slice(0, 100)}...`
                : change.key}
            </Box>
          }
        />
      )}
      {"value" in change && change.value && (
        <ContentRow
          title="Value:"
          value={
            <Box
              sx={{
                backgroundColor: semanticColors.codeBlock.background,
                padding: "2px 8px",
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.7rem",
                wordBreak: "break-all",
              }}
            >
              {String(change.value).length > 100
                ? `${String(change.value).slice(0, 100)}...`
                : change.value}
            </Box>
          }
        />
      )}
    </Stack>
  );
}
