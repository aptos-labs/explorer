import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import {useState} from "react";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../components/HashButton";
import {APTCurrencyValue} from "../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasFeeValue from "../../components/IndividualPageContent/ContentValue/GasFeeValue";
import JsonViewCard from "../../components/IndividualPageContent/JsonViewCard";
import {TransactionStatus} from "../../components/TransactionStatus";
import {TransactionTypeName} from "../../components/TransactionType";
import {Link} from "../../routing";
import {
  getTransactionAmount,
  getTransactionCounterparty,
} from "../Transaction/utils";
import {getTableFormattedTimestamp} from "../utils";

type DecibelTransactionCardProps = {
  transaction: Types.Transaction;
};

function FunctionDisplay({transaction}: {transaction: Types.Transaction}) {
  if (!("payload" in transaction)) return null;
  const payload = transaction.payload;
  if (!("function" in payload)) return null;
  const fn = payload.function;
  const parts = fn.split("::");
  if (parts.length !== 3) {
    return (
      <Typography
        variant="body2"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.85rem",
          wordBreak: "break-all",
        }}
      >
        {fn}
      </Typography>
    );
  }
  return (
    <Typography
      variant="body2"
      sx={{
        fontFamily: "monospace",
        fontSize: "0.85rem",
        wordBreak: "break-all",
      }}
    >
      <Box component="span" sx={{opacity: 0.6}}>
        {parts[0]}::
      </Box>
      <Box component="span" sx={{fontWeight: 600}}>
        {parts[1]}
      </Box>
      <Box component="span">::{parts[2]}</Box>
    </Typography>
  );
}

function EventsSummary({events}: {events: Types.Event[]}) {
  const theme = useTheme();
  if (events.length === 0) return null;

  const eventTypes = new Map<string, number>();
  for (const event of events) {
    const shortType = event.type.split("::").slice(-1)[0];
    eventTypes.set(shortType, (eventTypes.get(shortType) ?? 0) + 1);
  }

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.5}>
        {Array.from(eventTypes.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([type, count]) => (
            <Chip
              key={type}
              label={`${type}${count > 1 ? ` x${count}` : ""}`}
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
        {eventTypes.size > 8 && (
          <Typography
            variant="caption"
            sx={{color: theme.palette.text.secondary}}
          >
            +{eventTypes.size - 8} more
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

function PayloadPreview({transaction}: {transaction: Types.Transaction}) {
  if (!("payload" in transaction)) return null;
  const payload = transaction.payload as Types.TransactionPayload;

  if ("function" in payload && "arguments" in payload) {
    const args = payload.arguments;
    const typeArgs = payload.type_arguments;
    return (
      <Stack spacing={1}>
        {typeArgs && typeArgs.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{fontWeight: 600, display: "block", mb: 0.5}}
            >
              Type Arguments ({typeArgs.length})
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" rowGap={0.5}>
              {typeArgs.map((typeArg) => (
                <Chip
                  key={`type-arg-${typeArg}`}
                  label={typeArg.split("::").slice(-1)[0]}
                  size="small"
                  variant="outlined"
                  sx={{fontFamily: "monospace", fontSize: "0.7rem", height: 22}}
                />
              ))}
            </Stack>
          </Box>
        )}
        {args && args.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{fontWeight: 600, display: "block", mb: 0.5}}
            >
              Arguments ({args.length})
            </Typography>
            <JsonViewCard data={args} collapsedByDefault />
          </Box>
        )}
      </Stack>
    );
  }

  return <JsonViewCard data={payload} collapsedByDefault />;
}

function ChangeSummary({changes}: {changes: Types.WriteSetChange[]}) {
  const theme = useTheme();
  if (changes.length === 0) return null;

  const changeTypes = new Map<string, number>();
  for (const change of changes) {
    changeTypes.set(change.type, (changeTypes.get(change.type) ?? 0) + 1);
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.5}>
      {Array.from(changeTypes.entries()).map(([type, count]) => (
        <Chip
          key={type}
          label={`${type}: ${count}`}
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
    </Stack>
  );
}

export default function DecibelTransactionCard({
  transaction,
}: DecibelTransactionCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const version = "version" in transaction ? transaction.version : undefined;
  const hash = transaction.hash;
  const success = "success" in transaction ? transaction.success : undefined;
  const timestamp =
    "timestamp" in transaction ? transaction.timestamp : undefined;
  const sender =
    transaction.type === TransactionTypeName.User
      ? (transaction as Types.Transaction_UserTransaction).sender
      : undefined;
  const gasUsed = "gas_used" in transaction ? transaction.gas_used : undefined;
  const gasUnitPrice =
    "gas_unit_price" in transaction ? transaction.gas_unit_price : undefined;
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];
  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];
  const counterparty = getTransactionCounterparty(transaction);
  const amount = getTransactionAmount(transaction);

  return (
    <Box
      sx={{
        borderRadius: `${theme.shape.borderRadius}px`,
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <Box sx={{p: 2.5}}>
        <Stack
          direction={{xs: "column", md: "row"}}
          justifyContent="space-between"
          alignItems={{xs: "flex-start", md: "center"}}
          spacing={1}
        >
          {/* Left: version + status + type */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
          >
            <Link
              to={`/txn/${version}`}
              color="primary"
              style={{fontWeight: 700, fontSize: "1rem"}}
            >
              {version}
            </Link>
            {success !== undefined && <TransactionStatus success={success} />}
            <Chip
              label={transaction.type.replace("_transaction", "")}
              size="small"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                height: 22,
              }}
            />
          </Stack>

          {/* Right: timestamp + gas */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{flexShrink: 0}}
          >
            {timestamp && (
              <Typography
                variant="caption"
                sx={{color: theme.palette.text.secondary}}
              >
                {getTableFormattedTimestamp(timestamp)}
              </Typography>
            )}
            {gasUsed &&
              gasUnitPrice &&
              transaction.type === TransactionTypeName.User && (
                <Typography
                  variant="caption"
                  sx={{color: theme.palette.text.secondary}}
                >
                  Gas{" "}
                  <GasFeeValue
                    gasUsed={gasUsed}
                    gasUnitPrice={gasUnitPrice}
                    transactionData={
                      transaction as Types.Transaction_UserTransaction
                    }
                    netGasCost
                  />
                </Typography>
              )}
          </Stack>
        </Stack>

        {/* Second row: function + addresses */}
        <Stack
          direction={{xs: "column", sm: "row"}}
          spacing={{xs: 1, sm: 3}}
          alignItems={{sm: "center"}}
          sx={{mt: 1.5}}
        >
          <Box sx={{flex: 1, minWidth: 0}}>
            <FunctionDisplay transaction={transaction} />
          </Box>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            {sender && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  variant="caption"
                  sx={{color: theme.palette.text.secondary}}
                >
                  From
                </Typography>
                <HashButton
                  hash={sender}
                  type={HashType.ACCOUNT}
                  size="small"
                />
              </Stack>
            )}
            {counterparty && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography
                  variant="caption"
                  sx={{color: theme.palette.text.secondary}}
                >
                  {counterparty.role === "smartContract" ? "Contract" : "To"}
                </Typography>
                <HashButton
                  hash={counterparty.address}
                  type={HashType.ACCOUNT}
                  size="small"
                />
              </Stack>
            )}
            {amount !== undefined && (
              <Box>
                <APTCurrencyValue amount={amount.toString()} />
              </Box>
            )}
          </Stack>
        </Stack>

        {/* Third row: summary chips */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{mt: 1.5}}
          alignItems="center"
          flexWrap="wrap"
          rowGap={0.5}
        >
          {events.length > 0 && (
            <Chip
              label={`${events.length} event${events.length !== 1 ? "s" : ""}`}
              size="small"
              variant="outlined"
              sx={{fontSize: "0.75rem", height: 24}}
            />
          )}
          {changes.length > 0 && (
            <Chip
              icon={<CodeOutlinedIcon sx={{fontSize: 14}} />}
              label={`${changes.length} change${changes.length !== 1 ? "s" : ""}`}
              size="small"
              variant="outlined"
              sx={{fontSize: "0.75rem", height: 24}}
            />
          )}
          <EventsSummary events={events} />
        </Stack>
      </Box>

      {/* Expandable detail section */}
      <Accordion
        expanded={expanded}
        onChange={(_e, isExpanded) => setExpanded(isExpanded)}
        disableGutters
        sx={{
          boxShadow: "none",
          "&:before": {display: "none"},
          backgroundColor: "transparent",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 2.5,
            py: 0,
            minHeight: 36,
            borderTop: `1px solid ${theme.palette.divider}`,
            "& .MuiAccordionSummary-content": {margin: "8px 0"},
          }}
        >
          <Typography
            variant="caption"
            sx={{color: theme.palette.text.secondary, fontWeight: 500}}
          >
            {expanded ? "Hide Details" : "Show Details"}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{px: 2.5, pb: 2.5, pt: 0}}>
          {expanded && (
            <Stack spacing={2}>
              {/* Hash */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Hash
                </Typography>
                <HashButton hash={hash} type={HashType.TRANSACTION} />
              </Box>

              <Divider />

              {/* Events detail */}
              {events.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Events ({events.length})
                  </Typography>
                  <Stack spacing={1}>
                    {events.map((event, i) => (
                      <Box
                        key={`event-${event.type}-${event.sequence_number}`}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: theme.palette.background.default,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          #{i} — {event.type}
                        </Typography>
                        <JsonViewCard data={event.data} collapsedByDefault />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {events.length > 0 &&
                ("payload" in transaction || changes.length > 0) && <Divider />}

              {/* Payload detail */}
              {"payload" in transaction && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Payload
                  </Typography>
                  <PayloadPreview transaction={transaction} />
                </Box>
              )}

              {"payload" in transaction && changes.length > 0 && <Divider />}

              {/* Changes summary */}
              {changes.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      display: "block",
                      mb: 1,
                    }}
                  >
                    State Changes ({changes.length})
                  </Typography>
                  <ChangeSummary changes={changes} />
                </Box>
              )}

              {/* VM Status */}
              {"vm_status" in transaction && (
                <>
                  <Divider />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      VM Status
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{fontFamily: "monospace", fontSize: "0.85rem"}}
                    >
                      {(transaction as {vm_status: string}).vm_status}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
