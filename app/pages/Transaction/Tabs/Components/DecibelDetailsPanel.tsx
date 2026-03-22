import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../../../components/HashButton";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import {tryStandardizeAddress} from "../../../../utils";

const DECIBEL_ADDRESS =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

/**
 * Detect whether a transaction involves the Decibel contract.
 * Checks the sender, the payload function target, and event sources.
 */
export function isDecibelTransaction(transaction: Types.Transaction): boolean {
  const normalizedDecibel = tryStandardizeAddress(DECIBEL_ADDRESS);
  if (!normalizedDecibel) return false;

  // Check sender
  if (
    "sender" in transaction &&
    tryStandardizeAddress(transaction.sender) === normalizedDecibel
  ) {
    return true;
  }

  // Check payload function target
  if ("payload" in transaction && "function" in transaction.payload) {
    const fnAddr = transaction.payload.function.split("::")[0];
    if (tryStandardizeAddress(fnAddr) === normalizedDecibel) {
      return true;
    }
  }

  // Check events
  if ("events" in transaction) {
    for (const event of transaction.events) {
      const eventAddr = event.type.split("::")[0];
      if (tryStandardizeAddress(eventAddr) === normalizedDecibel) {
        return true;
      }
    }
  }

  // Check if any change addresses match
  if ("changes" in transaction) {
    for (const change of transaction.changes) {
      if (
        "address" in change &&
        tryStandardizeAddress(change.address) === normalizedDecibel
      ) {
        return true;
      }
    }
  }

  return false;
}

type DecibelDetailsPanelProps = {
  transaction: Types.Transaction_UserTransaction;
};

/**
 * Build a plain-English summary of a Decibel transaction.
 * Returns an array of sentence fragments meant to be rendered as a list.
 */
function summariseTransaction(
  transaction: Types.Transaction_UserTransaction,
): string[] {
  const lines: string[] = [];

  // 1. Describe the function called
  if ("function" in transaction.payload) {
    const fn = transaction.payload.function;
    const parts = fn.split("::");
    if (parts.length === 3) {
      const moduleName = parts[1];
      const funcName = parts[2]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      lines.push(`Called ${funcName} on the ${moduleName} module.`);
    }
  }

  // 2. Summarise events into human-readable actions
  const events = transaction.events ?? [];
  const deposits: {account: string; amount: string}[] = [];
  const withdrawals: {account: string; amount: string}[] = [];
  const transfers: {from: string; to: string; amount?: string}[] = [];
  let gasFeeOctas: bigint | undefined;
  let storageRefundOctas: bigint | undefined;
  const otherActions: string[] = [];

  for (const event of events) {
    const typeLower = event.type.toLowerCase();
    const data = event.data as Record<string, unknown> | undefined;

    if (typeLower.includes("feestatement") && data) {
      const totalFee =
        BigInt(String(data.total_charge_gas_units ?? "0")) *
        BigInt(transaction.gas_unit_price);
      gasFeeOctas = totalFee;
      if (data.storage_fee_refund_octas) {
        storageRefundOctas = BigInt(String(data.storage_fee_refund_octas));
      }
      continue;
    }

    if (
      (typeLower.includes("coin::deposit") ||
        typeLower.includes("fungible_asset::deposit")) &&
      data
    ) {
      const amount = data.amount ? String(data.amount) : undefined;
      const account = String(
        data.account ?? data.store ?? event.guid?.account_address ?? "",
      );
      if (amount) deposits.push({account, amount});
      continue;
    }

    if (
      (typeLower.includes("coin::withdraw") ||
        typeLower.includes("fungible_asset::withdraw")) &&
      data
    ) {
      const amount = data.amount ? String(data.amount) : undefined;
      const account = String(
        data.account ?? data.store ?? event.guid?.account_address ?? "",
      );
      if (amount) withdrawals.push({account, amount});
      continue;
    }

    if (typeLower.includes("transfer") && data) {
      transfers.push({
        from: String(data.from ?? data.sender ?? ""),
        to: String(data.to ?? data.recipient ?? ""),
        amount: data.amount ? String(data.amount) : undefined,
      });
      continue;
    }

    if (typeLower.includes("swap") && data) {
      const amtIn = data.amount_in ?? data.x_in ?? data.a_in;
      const amtOut = data.amount_out ?? data.y_out ?? data.b_out;
      if (amtIn && amtOut) {
        otherActions.push(
          `Swapped ${octasToApt(String(amtIn))} in for ${octasToApt(String(amtOut))} out.`,
        );
      } else {
        otherActions.push("Performed a token swap.");
      }
      continue;
    }

    if (typeLower.includes("mint") && data) {
      const amount = data.amount ? octasToApt(String(data.amount)) : "";
      otherActions.push(amount ? `Minted ${amount} tokens.` : "Minted tokens.");
      continue;
    }

    if (typeLower.includes("burn") && data) {
      const amount = data.amount ? octasToApt(String(data.amount)) : "";
      otherActions.push(amount ? `Burned ${amount} tokens.` : "Burned tokens.");
    }
  }

  // Aggregate transfers
  if (transfers.length === 1) {
    const t = transfers[0];
    const amt = t.amount ? ` of ${octasToApt(t.amount)}` : "";
    lines.push(`Transferred${amt} to ${truncateAddr(t.to)}.`);
  } else if (transfers.length > 1) {
    lines.push(`Performed ${transfers.length} transfers.`);
  }

  if (deposits.length > 0 && withdrawals.length > 0) {
    const totalDeposit = deposits.reduce(
      (s, d) => s + safeBigInt(d.amount),
      0n,
    );
    const totalWithdraw = withdrawals.reduce(
      (s, w) => s + safeBigInt(w.amount),
      0n,
    );
    if (totalDeposit > 0n || totalWithdraw > 0n) {
      lines.push(
        `Moved ${octasToApt(totalWithdraw.toString())} out and ${octasToApt(totalDeposit.toString())} in across ${deposits.length + withdrawals.length} operations.`,
      );
    }
  } else if (deposits.length > 0) {
    const total = deposits.reduce((s, d) => s + safeBigInt(d.amount), 0n);
    lines.push(
      `Received ${octasToApt(total.toString())} across ${deposits.length} deposit${deposits.length > 1 ? "s" : ""}.`,
    );
  } else if (withdrawals.length > 0) {
    const total = withdrawals.reduce((s, w) => s + safeBigInt(w.amount), 0n);
    lines.push(
      `Sent ${octasToApt(total.toString())} across ${withdrawals.length} withdrawal${withdrawals.length > 1 ? "s" : ""}.`,
    );
  }

  for (const action of otherActions) {
    lines.push(action);
  }

  // 3. Gas
  if (gasFeeOctas !== undefined) {
    const net =
      storageRefundOctas !== undefined
        ? gasFeeOctas - storageRefundOctas
        : gasFeeOctas;
    lines.push(`Gas fee: ${octasToApt(net.toString())} APT.`);
  }

  // 4. State changes count
  const changes = transaction.changes ?? [];
  if (changes.length > 0) {
    lines.push(
      `Modified ${changes.length} on-chain resource${changes.length > 1 ? "s" : ""}.`,
    );
  }

  if (lines.length === 0) {
    lines.push("Transaction processed on the Decibel contract.");
  }

  return lines;
}

function safeBigInt(value: string): bigint {
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function octasToApt(octas: string): string {
  try {
    const n = BigInt(octas);
    const decimal = Number(n) / 1e8;
    if (decimal === 0) return "0";
    if (Math.abs(decimal) < 0.0001) return `${decimal.toExponential(2)} APT`;
    return `${decimal.toLocaleString(undefined, {maximumFractionDigits: 8})} APT`;
  } catch {
    return octas;
  }
}

function truncateAddr(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{color: theme.palette.primary.main, display: "flex"}}>
        {icon}
      </Box>
      <Typography variant="subtitle2" sx={{fontWeight: 600}}>
        {title}
      </Typography>
      {count !== undefined && (
        <Chip
          label={count}
          size="small"
          sx={{height: 20, fontSize: "0.7rem", fontWeight: 600}}
        />
      )}
    </Stack>
  );
}

function shortenEventType(fullType: string): string {
  const parts = fullType.split("::");
  if (parts.length >= 3) {
    return `${parts[parts.length - 2]}::${parts[parts.length - 1]}`;
  }
  return fullType;
}

function categorizeEventType(eventType: string): {
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
} {
  const lower = eventType.toLowerCase();
  if (lower.includes("deposit")) return {label: "Deposit", color: "success"};
  if (lower.includes("withdraw")) return {label: "Withdraw", color: "warning"};
  if (lower.includes("transfer")) return {label: "Transfer", color: "info"};
  if (lower.includes("swap")) return {label: "Swap", color: "primary"};
  if (lower.includes("mint")) return {label: "Mint", color: "success"};
  if (lower.includes("burn")) return {label: "Burn", color: "error"};
  if (lower.includes("fee") || lower.includes("gas"))
    return {label: "Fee", color: "secondary"};
  if (lower.includes("register") || lower.includes("create"))
    return {label: "Create", color: "info"};
  if (lower.includes("liquidity"))
    return {label: "Liquidity", color: "primary"};
  if (lower.includes("stake")) return {label: "Stake", color: "info"};
  return {label: "Event", color: "default"};
}

function EventTimeline({events}: {events: Types.Event[]}) {
  const theme = useTheme();

  return (
    <Stack spacing={1}>
      {events.map((event, i) => {
        const shortType = shortenEventType(event.type);
        const category = categorizeEventType(event.type);
        const contractAddr = event.type.split("::")[0];
        const hasData =
          event.data &&
          typeof event.data === "object" &&
          Object.keys(event.data).length > 0;

        return (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: events lack unique identifier
            key={`evt-${event.type}-${event.sequence_number}-${i}`}
            sx={{
              p: 1.5,
              borderRadius: 1,
              backgroundColor: theme.palette.background.default,
              borderLeft: `3px solid ${theme.palette.primary.main}`,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              rowGap={0.5}
              sx={{mb: hasData ? 1 : 0}}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.secondary,
                  minWidth: 20,
                }}
              >
                #{i}
              </Typography>
              <Chip
                label={category.label}
                color={category.color}
                size="small"
                sx={{height: 20, fontSize: "0.7rem"}}
              />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  wordBreak: "break-all",
                }}
              >
                {shortType}
              </Typography>
              {contractAddr && contractAddr !== shortType && (
                <HashButton
                  hash={contractAddr}
                  type={HashType.ACCOUNT}
                  size="small"
                />
              )}
            </Stack>
            {hasData && <EventDataSummary data={event.data} />}
          </Box>
        );
      })}
    </Stack>
  );
}

function EventDataSummary({data}: {data: unknown}) {
  const theme = useTheme();

  if (typeof data !== "object" || data === null) return null;

  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) return null;

  const simpleEntries = entries.filter(
    ([, v]) => typeof v !== "object" || v === null,
  );
  const complexEntries = entries.filter(
    ([, v]) => typeof v === "object" && v !== null,
  );

  return (
    <Stack spacing={0.5}>
      {simpleEntries.length > 0 && (
        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          rowGap={0.5}
          sx={{pl: 0.5}}
        >
          {simpleEntries.map(([key, value]) => (
            <Stack
              key={key}
              direction="row"
              spacing={0.5}
              alignItems="baseline"
            >
              <Typography
                variant="caption"
                sx={{color: theme.palette.text.secondary, fontWeight: 500}}
              >
                {key}:
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  wordBreak: "break-all",
                }}
              >
                {formatEventValue(String(value), key)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
      {complexEntries.length > 0 && (
        <Box sx={{pl: 0.5}}>
          <JsonViewCard
            data={Object.fromEntries(complexEntries)}
            collapsedByDefault
          />
        </Box>
      )}
    </Stack>
  );
}

function formatEventValue(value: string, key: string): string {
  const lowerKey = key.toLowerCase();
  if (
    (lowerKey.includes("amount") || lowerKey === "apt" || lowerKey === "fee") &&
    /^\d+$/.test(value) &&
    value.length > 4
  ) {
    const num = BigInt(value);
    const decimal = Number(num) / 1e8;
    if (decimal >= 0.0001 && decimal < 1e15) {
      return `${decimal.toLocaleString(undefined, {maximumFractionDigits: 8})} (${value})`;
    }
  }
  return value;
}

function PayloadBreakdown({
  transaction,
}: {
  transaction: Types.Transaction_UserTransaction;
}) {
  const theme = useTheme();
  const payload = transaction.payload;
  if (!("function" in payload)) return null;

  const fn = payload.function;
  const parts = fn.split("::");
  const typeArgs = "type_arguments" in payload ? payload.type_arguments : [];
  const args = "arguments" in payload ? payload.arguments : [];

  return (
    <Stack spacing={1.5}>
      {/* Function name */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            display: "block",
            mb: 0.5,
          }}
        >
          Function
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            backgroundColor: theme.palette.background.default,
            fontFamily: "monospace",
            fontSize: "0.85rem",
            wordBreak: "break-all",
          }}
        >
          {parts.length === 3 ? (
            <>
              <HashButton
                hash={parts[0]}
                type={HashType.ACCOUNT}
                size="small"
              />
              <Typography
                component="span"
                sx={{fontFamily: "monospace", fontSize: "0.85rem"}}
              >
                ::<strong>{parts[1]}</strong>::{parts[2]}
              </Typography>
            </>
          ) : (
            fn
          )}
        </Box>
      </Box>

      {/* Type arguments */}
      {typeArgs && typeArgs.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              display: "block",
              mb: 0.5,
            }}
          >
            Type Arguments
          </Typography>
          <Stack spacing={0.5}>
            {typeArgs.map((typeArg) => {
              const taParts = typeArg.split("::");
              return (
                <Box
                  key={typeArg}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    backgroundColor: theme.palette.background.default,
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    wordBreak: "break-all",
                  }}
                >
                  {taParts.length >= 3 ? (
                    <>
                      <Box component="span" sx={{opacity: 0.5}}>
                        {taParts.slice(0, -1).join("::")}::
                      </Box>
                      <Box component="span" sx={{fontWeight: 600}}>
                        {taParts[taParts.length - 1]}
                      </Box>
                    </>
                  ) : (
                    typeArg
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Arguments */}
      {args && args.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              display: "block",
              mb: 0.5,
            }}
          >
            Arguments ({args.length})
          </Typography>
          <Stack spacing={0.5}>
            {args.map((arg, i) => (
              <Box
                // biome-ignore lint/suspicious/noArrayIndexKey: args lack unique identifier
                key={`arg-${i}`}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    [{i}]
                  </Typography>
                  {typeof arg === "object" ? (
                    <JsonViewCard data={arg} collapsedByDefault />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {String(arg)}
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function ChangeSummarySection({changes}: {changes: Types.WriteSetChange[]}) {
  const theme = useTheme();

  const changeTypes = new Map<string, number>();
  const moduleSet = new Set<string>();
  for (const change of changes) {
    changeTypes.set(change.type, (changeTypes.get(change.type) ?? 0) + 1);
    if ("data" in change && change.data && "type" in change.data) {
      const parts = change.data.type.split("::");
      if (parts.length >= 2) {
        moduleSet.add(`${parts[0]}::${parts[1]}`);
      }
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.5}>
        {Array.from(changeTypes.entries()).map(([type, count]) => (
          <Chip
            key={type}
            label={`${type.replace("_resource", "").replace("_", " ")}: ${count}`}
            size="small"
            variant="outlined"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              height: 24,
              borderColor: theme.palette.divider,
            }}
          />
        ))}
      </Stack>
      {moduleSet.size > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              display: "block",
              mb: 0.5,
            }}
          >
            Modules Touched
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" rowGap={0.5}>
            {Array.from(moduleSet)
              .slice(0, 12)
              .map((mod) => (
                <Chip
                  key={mod}
                  label={mod.split("::").slice(-1)[0]}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    height: 22,
                    borderColor: theme.palette.divider,
                  }}
                />
              ))}
            {moduleSet.size > 12 && (
              <Typography
                variant="caption"
                sx={{color: theme.palette.text.secondary}}
              >
                +{moduleSet.size - 12} more
              </Typography>
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

export default function DecibelDetailsPanel({
  transaction,
}: DecibelDetailsPanelProps) {
  const theme = useTheme();

  const events = transaction.events ?? [];
  const changes = transaction.changes ?? [];
  const hasPayload =
    "payload" in transaction && "function" in transaction.payload;
  const summary = summariseTransaction(transaction);

  return (
    <Accordion
      defaultExpanded={false}
      disableGutters
      sx={{
        mb: 2,
        borderRadius: `${theme.shape.borderRadius}px !important`,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}`,
        overflow: "hidden",
        "&:before": {display: "none"},
        "&.Mui-expanded": {mb: 2},
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: 3,
          py: 0.5,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
          "& .MuiAccordionSummary-content": {margin: "8px 0"},
        }}
      >
        <Stack spacing={0.25}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label="Decibel"
              color="primary"
              size="small"
              sx={{fontWeight: 600}}
            />
            <Typography
              variant="body2"
              sx={{color: theme.palette.text.secondary}}
            >
              {summary[0]}
            </Typography>
          </Stack>
          {summary.length > 1 && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                pl: 0.5,
                opacity: 0.8,
              }}
            >
              {summary.slice(1, 3).join(" ")}{" "}
              {summary.length > 3 ? `(+${summary.length - 3} more)` : ""}
            </Typography>
          )}
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{p: 3, pt: 2}}>
        <Stack spacing={3}>
          {/* What Happened summary */}
          <Box>
            <SectionHeader
              icon={
                <Typography sx={{fontSize: "1rem", lineHeight: 1}}>
                  💡
                </Typography>
              }
              title="What Happened"
            />
            <Stack
              component="ul"
              spacing={0.5}
              sx={{mt: 1, pl: 2.5, mb: 0, listStyleType: "disc"}}
            >
              {summary.map((line) => (
                <Typography
                  component="li"
                  key={line}
                  variant="body2"
                  sx={{pl: 0.5}}
                >
                  {line}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Divider />

          {events.length > 0 && (
            <Box>
              <SectionHeader
                icon={<EventNoteOutlinedIcon fontSize="small" />}
                title="Event Timeline"
                count={events.length}
              />
              <Box sx={{mt: 1.5}}>
                <EventTimeline events={events} />
              </Box>
            </Box>
          )}

          {events.length > 0 && hasPayload && <Divider />}

          {hasPayload && (
            <Box>
              <SectionHeader
                icon={<InventoryOutlinedIcon fontSize="small" />}
                title="Payload Breakdown"
              />
              <Box sx={{mt: 1.5}}>
                <PayloadBreakdown transaction={transaction} />
              </Box>
            </Box>
          )}

          {(hasPayload || events.length > 0) && changes.length > 0 && (
            <Divider />
          )}

          {changes.length > 0 && (
            <Box>
              <SectionHeader
                icon={<CodeOutlinedIcon fontSize="small" />}
                title="State Changes"
                count={changes.length}
              />
              <Box sx={{mt: 1.5}}>
                <ChangeSummarySection changes={changes} />
              </Box>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
