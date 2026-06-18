import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  Box,
  Chip,
  type ChipProps,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import * as React from "react";
import {useGetAccountModule} from "../../../../api/hooks/useGetAccountModule";
import HashButton, {HashType} from "../../../../components/HashButton";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import {
  ResponsiveKeyValueRow,
  ResponsiveKeyValueTable,
} from "../../../../components/Table/ResponsiveKeyValueTable";
import {Link} from "../../../../routing";
import {parseTimestampString, tryStandardizeAddress} from "../../../../utils";
import {type DecodedMoveValue, decodeMoveArguments} from "./decodeMoveArgument";
import {
  type DecodedMultisigPayload,
  decodeMultisigTransactionPayload,
} from "./decodeMultisigPayload";
import MoveFunctionParamTypeBadge from "./MoveFunctionParamTypeBadge";
import {useEntryFunctionArgNames} from "./useEntryFunctionArgNames";

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/** Module that emits multisig governance events (Aptos Framework). */
export const MULTISIG_ACCOUNT_MODULE = "0x1::multisig_account" as const;
const MULTISIG_EVENT_PREFIX = `${MULTISIG_ACCOUNT_MODULE}::` as const;

/**
 * True for events emitted by `0x1::multisig_account` such as
 * `0x1::multisig_account::TransactionExecutionSucceeded`. Matches both the v1
 * (`*Event` suffix) and v2 (module event) naming conventions.
 */
export function isMultisigEvent(eventType: string): boolean {
  return eventType.startsWith(MULTISIG_EVENT_PREFIX);
}

/** `0x1::multisig_account::TransactionExecutionSucceeded` -> `TransactionExecutionSucceeded`. */
function getEventShortName(eventType: string): string {
  const short = eventType.split("::").pop() ?? eventType;
  // v1 events carry an `Event` suffix (e.g. `VoteEvent`); v2 module events drop
  // it (e.g. `Vote`). Normalize so both map to the same renderer config.
  return short.endsWith("Event") ? short.slice(0, -"Event".length) : short;
}

// ---------------------------------------------------------------------------
// Field renderers
// ---------------------------------------------------------------------------

type FieldKind =
  | "address"
  | "addressList"
  | "count"
  | "vote"
  | "hexPayload"
  | "executionError"
  | "multisigTransaction"
  | "json";

type FieldConfig = {
  key: string;
  label: string;
  kind: FieldKind;
};

type EventConfig = {
  /** Friendly label shown in the summary chip. */
  summary: string;
  summaryColor: ChipProps["color"];
  /** Fields rendered, in order, when present in the event data. */
  fields: FieldConfig[];
};

const COMMON_LABELS: Record<string, string> = {
  multisig_account: "Multisig Account",
  sequence_number: "Sequence Number",
};

// Field configs keyed by the normalized (suffix-stripped) event short name.
const EVENT_CONFIGS: Record<string, EventConfig> = {
  TransactionExecutionSucceeded: {
    summary: "Execution Succeeded",
    summaryColor: "success",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "executor", label: "Executor", kind: "address"},
      {key: "sequence_number", label: "Sequence Number", kind: "count"},
      {key: "num_approvals", label: "Approvals", kind: "count"},
      {key: "transaction_payload", label: "Payload", kind: "hexPayload"},
    ],
  },
  TransactionExecutionFailed: {
    summary: "Execution Failed",
    summaryColor: "error",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "executor", label: "Executor", kind: "address"},
      {key: "sequence_number", label: "Sequence Number", kind: "count"},
      {key: "num_approvals", label: "Approvals", kind: "count"},
      {
        key: "execution_error",
        label: "Execution Error",
        kind: "executionError",
      },
      {key: "transaction_payload", label: "Payload", kind: "hexPayload"},
    ],
  },
  ExecuteRejectedTransaction: {
    summary: "Rejected Transaction Executed",
    summaryColor: "warning",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "executor", label: "Executor", kind: "address"},
      {key: "sequence_number", label: "Sequence Number", kind: "count"},
      {key: "num_rejections", label: "Rejections", kind: "count"},
    ],
  },
  CreateTransaction: {
    summary: "Transaction Created",
    summaryColor: "info",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "creator", label: "Creator", kind: "address"},
      {key: "sequence_number", label: "Sequence Number", kind: "count"},
      {key: "transaction", label: "Transaction", kind: "multisigTransaction"},
    ],
  },
  Vote: {
    summary: "Vote",
    summaryColor: "default",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "owner", label: "Owner", kind: "address"},
      {key: "sequence_number", label: "Sequence Number", kind: "count"},
      {key: "approved", label: "Vote", kind: "vote"},
    ],
  },
  AddOwners: {
    summary: "Owners Added",
    summaryColor: "success",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "owners_added", label: "Owners Added", kind: "addressList"},
    ],
  },
  RemoveOwners: {
    summary: "Owners Removed",
    summaryColor: "warning",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "owners_removed", label: "Owners Removed", kind: "addressList"},
    ],
  },
  UpdateSignaturesRequired: {
    summary: "Signatures Required Updated",
    summaryColor: "info",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {
        key: "old_num_signatures_required",
        label: "Previous Signatures Required",
        kind: "count",
      },
      {
        key: "new_num_signatures_required",
        label: "New Signatures Required",
        kind: "count",
      },
    ],
  },
  MetadataUpdated: {
    summary: "Metadata Updated",
    summaryColor: "info",
    fields: [
      {key: "multisig_account", label: "Multisig Account", kind: "address"},
      {key: "old_metadata", label: "Previous Metadata", kind: "json"},
      {key: "new_metadata", label: "New Metadata", kind: "json"},
    ],
  },
};

function MonoText({children}: {children: React.ReactNode}) {
  return (
    <Typography
      variant="body2"
      sx={{fontFamily: "monospace", overflowWrap: "anywhere"}}
    >
      {children}
    </Typography>
  );
}

function hexByteLength(hex: string): number | undefined {
  if (!/^0x[0-9a-fA-F]*$/.test(hex)) return undefined;
  return (hex.length - 2) / 2;
}

function HexPayloadValue({value}: {value: unknown}) {
  const hex = typeof value === "string" ? value : JSON.stringify(value);
  const byteLength =
    typeof value === "string" ? hexByteLength(value) : undefined;
  return (
    <Box sx={{minWidth: 0, maxWidth: "100%"}}>
      {byteLength !== undefined ? (
        <Typography
          variant="caption"
          sx={{display: "block", color: "text.secondary", mb: 0.5}}
        >
          {byteLength} bytes
        </Typography>
      ) : null}
      <Box
        sx={{
          maxHeight: 160,
          overflow: "auto",
          p: 1,
          borderRadius: 1,
          bgcolor: (theme) => theme.palette.action.hover,
        }}
      >
        <MonoText>{hex}</MonoText>
      </Box>
    </Box>
  );
}

function FieldCaption({children}: {children: React.ReactNode}) {
  return (
    <Typography
      variant="caption"
      sx={{display: "block", color: "text.secondary", mb: 0.5}}
    >
      {children}
    </Typography>
  );
}

/** Links a decoded `addr::module::function` id to its on-chain Move source. */
function FunctionLink({fn}: {fn: string}) {
  const [rawAddress, moduleName, functionName] = fn.split("::");
  const address = tryStandardizeAddress(rawAddress) ?? rawAddress;
  if (!moduleName || !functionName) {
    return <MonoText>{fn}</MonoText>;
  }
  return (
    <Link
      to={`/account/${address}/modules/code/${moduleName}/${functionName}`}
      underline="hover"
      style={{color: "inherit"}}
    >
      <MonoText>{fn}</MonoText>
    </Link>
  );
}

/** Renders a typed (ABI-decoded) Move argument value, recursing into containers. */
function ArgValueView({value}: {value: DecodedMoveValue}) {
  switch (value.kind) {
    case "address":
      return (
        <HashButton hash={value.value} type={HashType.ACCOUNT} size="small" />
      );
    case "object":
      return (
        <HashButton hash={value.value} type={HashType.OBJECT} size="small" />
      );
    case "string":
      return <MonoText>"{value.value}"</MonoText>;
    case "bool":
      return <MonoText>{String(value.value)}</MonoText>;
    case "number":
      return <MonoText>{value.value}</MonoText>;
    case "bytes":
      return <MonoText>{value.value}</MonoText>;
    case "option":
      return value.value === null ? (
        <MonoText>None</MonoText>
      ) : (
        <ArgValueView value={value.value} />
      );
    case "vector":
      return value.value.length === 0 ? (
        <MonoText>[]</MonoText>
      ) : (
        <Stack spacing={0.5} sx={{alignItems: "flex-start"}}>
          {value.value.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: positional items
            <ArgValueView key={i} value={item} />
          ))}
        </Stack>
      );
    default:
      return null;
  }
}

/** Decoded entry-function view for a multisig payload, with raw-bytes toggle. */
function DecodedPayloadView({
  decoded,
  rawHex,
}: {
  decoded: DecodedMultisigPayload;
  rawHex: string;
}) {
  const [showRaw, setShowRaw] = React.useState(false);

  const [rawAddress, moduleName, functionName] = decoded.function.split("::");
  const address = tryStandardizeAddress(rawAddress) ?? rawAddress;
  const canFetchAbi = Boolean(address && moduleName && functionName);

  // Fetch the module ABI so we can decode raw argument bytes into typed values.
  const {data: moduleData} = useGetAccountModule(
    address,
    moduleName ?? "",
    undefined,
    {enabled: canFetchAbi},
  );

  const moveFunction = React.useMemo(
    () =>
      moduleData?.abi?.exposed_functions?.find(
        (fn) => fn.name === functionName,
      ),
    [moduleData, functionName],
  );

  const paramTypes = React.useMemo(
    () =>
      moveFunction?.params?.filter((p) => p !== "&signer" && p !== "signer"),
    [moveFunction],
  );

  // Resolve argument / type-parameter names from the module's Move source.
  const {functionArgNames, typeArgNames} = useEntryFunctionArgNames({
    address: canFetchAbi ? address : undefined,
    moduleName,
    functionName,
    argCount: decoded.arguments.length,
    typeArgCount: decoded.typeArguments.length,
    moveFunction,
  });

  const decodedArgs = React.useMemo(
    () => decodeMoveArguments(decoded.arguments, paramTypes),
    [decoded.arguments, paramTypes],
  );

  return (
    <Stack spacing={1} sx={{minWidth: 0, maxWidth: "100%"}}>
      <Stack
        direction="row"
        spacing={1}
        sx={{alignItems: "center", flexWrap: "wrap"}}
      >
        <Chip
          label="Decoded"
          size="small"
          color="success"
          variant="outlined"
          sx={{fontWeight: 600}}
        />
        <Box sx={{minWidth: 0}}>
          <FunctionLink fn={decoded.function} />
        </Box>
      </Stack>
      {decoded.typeArguments.length > 0 && (
        <Box>
          <FieldCaption>Type Arguments</FieldCaption>
          <Stack spacing={0.25}>
            {decoded.typeArguments.map((tag, i) => {
              const name = typeArgNames?.[i];
              return (
                <Stack
                  key={tag}
                  direction="row"
                  spacing={1}
                  sx={{alignItems: "baseline", flexWrap: "wrap"}}
                >
                  <Typography
                    variant="caption"
                    sx={{color: "text.secondary", fontFamily: "monospace"}}
                  >
                    {name ?? `T${i}`}:
                  </Typography>
                  <MonoText>{tag}</MonoText>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}
      <Box>
        <FieldCaption>Arguments ({decoded.arguments.length})</FieldCaption>
        {decoded.arguments.length === 0 ? (
          <MonoText>None</MonoText>
        ) : (
          <Stack spacing={0.5}>
            {decoded.arguments.map((arg, i) => {
              const typeStr = paramTypes?.[i];
              const decodedArg = decodedArgs[i];
              const name = functionArgNames?.[i];
              return (
                <Box
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional args
                  key={i}
                  sx={{
                    p: 0.75,
                    borderRadius: 1,
                    bgcolor: (theme) => theme.palette.action.hover,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{alignItems: "baseline", flexWrap: "wrap", mb: 0.5}}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {name ?? `#${i}`}
                    </Typography>
                    {typeStr ? (
                      <MoveFunctionParamTypeBadge
                        typeStr={typeStr}
                        variant="card"
                      />
                    ) : null}
                  </Stack>
                  <Box sx={{minWidth: 0, maxWidth: "100%"}}>
                    {decodedArg ? (
                      <ArgValueView value={decodedArg} />
                    ) : (
                      <MonoText>{arg}</MonoText>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
        {paramTypes === undefined && decoded.arguments.length > 0 ? (
          <Typography
            variant="caption"
            sx={{display: "block", color: "text.secondary", mt: 0.5}}
          >
            Raw BCS argument bytes; module ABI unavailable for typed values.
          </Typography>
        ) : null}
      </Box>
      <Box>
        <Typography
          component="button"
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          variant="caption"
          sx={{
            p: 0,
            border: 0,
            background: "none",
            cursor: "pointer",
            color: "primary.main",
            textAlign: "left",
          }}
        >
          {showRaw ? "Hide encoded bytes" : "Show encoded bytes"}
        </Typography>
        {showRaw && (
          <Box sx={{mt: 0.5}}>
            <HexPayloadValue value={rawHex} />
          </Box>
        )}
      </Box>
    </Stack>
  );
}

/** Renders a multisig payload (hex) as a decoded entry function when possible. */
function PayloadValue({value}: {value: unknown}) {
  const hex = typeof value === "string" ? value : undefined;
  const decoded = React.useMemo(
    () => decodeMultisigTransactionPayload(hex),
    [hex],
  );
  if (hex === undefined) {
    return <MonoText>{String(value)}</MonoText>;
  }
  if (!decoded) {
    return <HexPayloadValue value={value} />;
  }
  return <DecodedPayloadView decoded={decoded} rawHex={hex} />;
}

function optionVecFirst(value: unknown): string | undefined {
  if (typeof value === "object" && value !== null && "vec" in value) {
    const vec = (value as {vec: unknown[]}).vec;
    if (Array.isArray(vec) && vec.length > 0 && typeof vec[0] === "string") {
      return vec[0];
    }
  }
  return undefined;
}

function SubRow({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <FieldCaption>{label}</FieldCaption>
      <Box sx={{minWidth: 0, maxWidth: "100%"}}>{children}</Box>
    </Box>
  );
}

/** Renders the `MultisigTransaction` object carried by a `CreateTransaction` event. */
function MultisigTransactionValue({value}: {value: unknown}) {
  if (typeof value !== "object" || value === null) {
    return <MonoText>{String(value)}</MonoText>;
  }
  const obj = value as Record<string, unknown>;
  const creator = typeof obj.creator === "string" ? obj.creator : undefined;
  const created =
    typeof obj.creation_time_secs === "string"
      ? obj.creation_time_secs
      : undefined;
  const payloadHex = optionVecFirst(obj.payload);
  const payloadHash = optionVecFirst(obj.payload_hash);
  const votes =
    typeof obj.votes === "object" &&
    obj.votes !== null &&
    "data" in obj.votes &&
    Array.isArray((obj.votes as {data: unknown}).data)
      ? ((obj.votes as {data: Array<{key?: string; value?: boolean}>}).data ??
        [])
      : [];

  return (
    <Stack spacing={1.5} sx={{minWidth: 0, maxWidth: "100%"}}>
      {creator && (
        <SubRow label="Creator">
          <HashButton hash={creator} type={HashType.ACCOUNT} size="small" />
        </SubRow>
      )}
      {created && (
        <SubRow label="Created">
          <MonoText>{parseTimestampString(created)}</MonoText>
        </SubRow>
      )}
      <SubRow label="Payload">
        {payloadHex !== undefined ? (
          <PayloadValue value={payloadHex} />
        ) : payloadHash !== undefined ? (
          <Stack spacing={0.5}>
            <Chip
              label="Payload hash only"
              size="small"
              variant="outlined"
              sx={{alignSelf: "flex-start"}}
            />
            <HexPayloadValue value={payloadHash} />
          </Stack>
        ) : (
          <MonoText>None</MonoText>
        )}
      </SubRow>
      {votes.length > 0 && (
        <SubRow label={`Votes (${votes.length})`}>
          <Stack spacing={0.5}>
            {votes.map((vote, i) => (
              <Stack
                // biome-ignore lint/suspicious/noArrayIndexKey: voters may repeat
                key={`${vote.key ?? "vote"}-${i}`}
                direction="row"
                spacing={1}
                sx={{alignItems: "center", flexWrap: "wrap"}}
              >
                {vote.key && (
                  <HashButton
                    hash={vote.key}
                    type={HashType.ACCOUNT}
                    size="small"
                  />
                )}
                <Chip
                  label={vote.value ? "Approved" : "Rejected"}
                  size="small"
                  color={vote.value ? "success" : "error"}
                  sx={{fontWeight: 600}}
                />
              </Stack>
            ))}
          </Stack>
        </SubRow>
      )}
    </Stack>
  );
}

function ExecutionErrorValue({value}: {value: unknown}) {
  if (typeof value !== "object" || value === null) {
    return <MonoText>{String(value)}</MonoText>;
  }
  const error = value as Record<string, unknown>;
  const abortLocation = error.abort_location;
  const errorType = error.error_type;
  const errorCode = error.error_code;
  return (
    <Stack spacing={0.5}>
      {errorType !== undefined && (
        <Chip
          label={String(errorType)}
          size="small"
          color="error"
          variant="outlined"
          sx={{alignSelf: "flex-start", fontWeight: 600}}
        />
      )}
      {abortLocation !== undefined && (
        <MonoText>Abort location: {String(abortLocation)}</MonoText>
      )}
      {errorCode !== undefined && (
        <MonoText>Error code: {String(errorCode)}</MonoText>
      )}
    </Stack>
  );
}

function AddressListValue({value}: {value: unknown}) {
  const addresses = Array.isArray(value) ? value : [];
  if (addresses.length === 0) {
    return <MonoText>None</MonoText>;
  }
  return (
    <Stack spacing={1} sx={{alignItems: "flex-start"}}>
      {addresses.map((addr, i) => (
        <HashButton
          // biome-ignore lint/suspicious/noArrayIndexKey: addresses may repeat
          key={`${String(addr)}-${i}`}
          hash={String(addr)}
          type={HashType.ACCOUNT}
          size="small"
        />
      ))}
    </Stack>
  );
}

function renderFieldValue(kind: FieldKind, value: unknown): React.ReactNode {
  switch (kind) {
    case "address":
      return (
        <HashButton hash={String(value)} type={HashType.ACCOUNT} size="small" />
      );
    case "addressList":
      return <AddressListValue value={value} />;
    case "count":
      return <MonoText>{String(value)}</MonoText>;
    case "vote":
      return (
        <Chip
          label={value === true ? "Approved" : "Rejected"}
          size="small"
          color={value === true ? "success" : "error"}
          sx={{fontWeight: 600}}
        />
      );
    case "hexPayload":
      return <PayloadValue value={value} />;
    case "executionError":
      return <ExecutionErrorValue value={value} />;
    case "multisigTransaction":
      return <MultisigTransactionValue value={value} />;
    case "json":
      return (
        <Box sx={{minWidth: 0, maxWidth: "100%"}}>
          <JsonViewCard
            data={
              typeof value === "object" && value !== null
                ? (value as Record<string, unknown>)
                : {value}
            }
          />
        </Box>
      );
    default:
      return <MonoText>{String(value)}</MonoText>;
  }
}

function prettifyKey(key: string): string {
  if (key in COMMON_LABELS) return COMMON_LABELS[key];
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function EventTable({
  summary,
  summaryColor,
  rawData,
  children,
}: {
  summary: string;
  summaryColor: ChipProps["color"];
  rawData: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [showRaw, setShowRaw] = React.useState(false);

  return (
    <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          pt: 1,
          pb: 0.5,
        }}
      >
        <Chip
          label={summary}
          size="small"
          color={summaryColor}
          sx={{fontWeight: 600}}
        />
        <Tooltip title={showRaw ? "Formatted view" : "Raw JSON"}>
          <IconButton size="small" onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? (
              <TableChartOutlinedIcon fontSize="small" />
            ) : (
              <CodeOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Stack>
      {showRaw ? (
        <Box sx={{p: 1, pt: 0, maxWidth: "100%", minWidth: 0}}>
          <JsonViewCard data={rawData} />
        </Box>
      ) : (
        <ResponsiveKeyValueTable
          size="small"
          tableLayout="fixed"
          stackContainerSx={{px: 1.5, pb: 1, pt: 0}}
        >
          {children}
        </ResponsiveKeyValueTable>
      )}
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export default function MultisigEventView({
  eventType,
  data,
}: {
  eventType: string;
  data: Record<string, unknown>;
}) {
  const shortName = getEventShortName(eventType);
  const config = EVENT_CONFIGS[shortName];

  if (!config) {
    return <JsonViewCard data={data} />;
  }

  const configuredKeys = new Set(config.fields.map((field) => field.key));
  const knownRows = config.fields
    .filter((field) => data[field.key] !== undefined)
    .map((field) => (
      <ResponsiveKeyValueRow key={field.key} label={field.label}>
        {renderFieldValue(field.kind, data[field.key])}
      </ResponsiveKeyValueRow>
    ));

  // Surface any fields not in the config so new framework fields stay visible.
  const extraRows = Object.entries(data)
    .filter(([key]) => !configuredKeys.has(key))
    .map(([key, value]) => (
      <ResponsiveKeyValueRow key={key} label={prettifyKey(key)}>
        {typeof value === "object" && value !== null ? (
          renderFieldValue("json", value)
        ) : (
          <MonoText>{String(value)}</MonoText>
        )}
      </ResponsiveKeyValueRow>
    ));

  return (
    <EventTable
      summary={config.summary}
      summaryColor={config.summaryColor}
      rawData={data}
    >
      {knownRows}
      {extraRows}
    </EventTable>
  );
}
