import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import * as React from "react";
import {useGetDecibelMarketName} from "../../../../api/hooks/useGetDecibelMarketName";
import HashButton, {HashType} from "../../../../components/HashButton";
import JsonViewCard from "../../../../components/IndividualPageContent/JsonViewCard";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";
import {
  ResponsiveKeyValueRow,
  ResponsiveKeyValueTable,
} from "../../../../components/Table/ResponsiveKeyValueTable";
import {DECIBEL_CONTRACTS} from "../../../../utils/decibel";

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

export function isDecibelEvent(eventType: string): boolean {
  return DECIBEL_CONTRACTS.some((addr) => eventType.startsWith(`${addr}::`));
}

const RENDERERS: Record<
  string,
  React.ComponentType<{data: Record<string, unknown>}>
> = {
  OrderEvent: OrderEventView,
  BulkOrderPlacedEvent: BulkOrderPlacedEventView,
  BulkOrderFilledEvent: BulkOrderFilledEventView,
  TradeEvent: TradeEventView,
  CollateralBalanceChangeEvent: CollateralBalanceChangeEventView,
  PositionUpdateEvent: PositionUpdateEventView,
  OpenInterestUpdateEvent: OpenInterestUpdateEventView,
  PriceUpdateEvent: PriceUpdateEventView,
};

function getEventShortName(eventType: string): string {
  return eventType.split("::").pop() ?? eventType;
}

export default function DecibelEventView({
  eventType,
  data,
}: {
  eventType: string;
  data: Record<string, unknown>;
}) {
  const shortName = getEventShortName(eventType);
  const Renderer = RENDERERS[shortName];

  if (!Renderer) {
    return <JsonViewCard data={data} />;
  }

  return <Renderer data={data} />;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const Row = ResponsiveKeyValueRow;

function EventTable({
  children,
  rawData,
}: {
  children: React.ReactNode;
  rawData: Record<string, unknown>;
}) {
  const [showRaw, setShowRaw] = React.useState(false);

  return (
    <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
      <Stack direction="row" sx={{justifyContent: "flex-end", px: 1, pt: 0.5}}>
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

function SideLabel({isBid}: {isBid: boolean}) {
  return (
    <Chip
      label={isBid ? "Buy" : "Sell"}
      size="small"
      color={isBid ? "success" : "error"}
      sx={{fontWeight: 600}}
    />
  );
}

function AddressValue({hash}: {hash: string}) {
  return <HashButton hash={hash} type={HashType.ACCOUNT} size="small" />;
}

function ObjectValue({hash}: {hash: string}) {
  return <HashButton hash={hash} type={HashType.OBJECT} size="small" />;
}

function MarketValue({hash}: {hash: string}) {
  const {data: name} = useGetDecibelMarketName(hash);
  return (
    <Stack
      direction={{xs: "column", sm: "row"}}
      spacing={1}
      sx={{
        width: "100%",
        minWidth: 0,
        alignItems: {xs: "flex-start", sm: "center"},
      }}
    >
      {name && (
        <Typography variant="body2" sx={{fontWeight: 600}}>
          {name}
        </Typography>
      )}
      <Box sx={{minWidth: 0, maxWidth: "100%"}}>
        <HashButton hash={hash} type={HashType.OBJECT} size="small" />
      </Box>
    </Stack>
  );
}

function extractInner(val: unknown): string | undefined {
  if (typeof val === "object" && val !== null && "inner" in val) {
    return (val as {inner: string}).inner;
  }
  return undefined;
}

function extractVariant(val: unknown): string | undefined {
  if (typeof val === "object" && val !== null && "__variant__" in val) {
    return (val as {__variant__: string}).__variant__;
  }
  return undefined;
}

function extractVecFirst(val: unknown): unknown | undefined {
  if (typeof val === "object" && val !== null && "vec" in val) {
    const vec = (val as {vec: unknown[]}).vec;
    return vec.length > 0 ? vec[0] : undefined;
  }
  return undefined;
}

function MonoText({children}: {children: React.ReactNode}) {
  return (
    <Typography variant="body2" sx={{fontFamily: "monospace"}}>
      {children}
    </Typography>
  );
}

// ---------------------------------------------------------------------------
// OrderEvent
// ---------------------------------------------------------------------------

function OrderEventView({data}: {data: Record<string, unknown>}) {
  const isBid = data.is_bid === true;
  const status = extractVariant(data.status);
  const tif = extractVariant(data.time_in_force);
  const cancelReason = extractVariant(
    extractVecFirst(data.cancellation_reason),
  );
  const clientOrderId = extractVecFirst(data.client_order_id) as
    | string
    | undefined;

  return (
    <EventTable rawData={data}>
      <Row label="Side">
        <SideLabel isBid={isBid} />
        {data.is_taker === true && (
          <Chip label="Taker" size="small" variant="outlined" sx={{ml: 1}} />
        )}
      </Row>
      <Row label="Market">
        <MarketValue hash={String(data.market)} />
      </Row>
      <Row label="Price">
        <MonoText>{String(data.price)}</MonoText>
      </Row>
      <Row label="Original Size">
        <MonoText>{String(data.orig_size)}</MonoText>
      </Row>
      {data.remaining_size !== undefined && (
        <Row label="Remaining Size">
          <MonoText>{String(data.remaining_size)}</MonoText>
        </Row>
      )}
      {data.size_delta !== undefined && (
        <Row label="Size Delta">
          <MonoText>{String(data.size_delta)}</MonoText>
        </Row>
      )}
      {status && (
        <Row label="Status">
          <Chip label={status} size="small" variant="outlined" />
        </Row>
      )}
      {tif && <Row label="Time in Force">{tif}</Row>}
      {cancelReason && <Row label="Cancel Reason">{cancelReason}</Row>}
      <Row label="Order ID">
        <MonoText>{String(data.order_id)}</MonoText>
      </Row>
      <Row label="User">
        <AddressValue hash={String(data.user)} />
      </Row>
      {"parent" in data && data.parent ? (
        <Row label="Parent">
          <AddressValue hash={String(data.parent)} />
        </Row>
      ) : null}
      {clientOrderId && (
        <Row label="Client Order ID">
          <MonoText>{clientOrderId}</MonoText>
        </Row>
      )}
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// BulkOrderPlacedEvent
// ---------------------------------------------------------------------------

function PriceSizeTable({
  label,
  prices,
  sizes,
  color,
}: {
  label: string;
  prices: string[];
  sizes: string[];
  color: "success" | "error";
}) {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("md"));
  if (prices.length === 0) return null;

  if (isNarrow) {
    return (
      <Box sx={{mb: 1, width: "100%", minWidth: 0}}>
        <Typography
          variant="subtitle2"
          sx={{mb: 0.5, color: theme.palette[color].main}}
        >
          {label} ({prices.length})
        </Typography>
        <Stack spacing={0.75}>
          {prices.map((price, i) => {
            const size = sizes[i] ?? "—";
            return (
              <Stack
                key={`${price}-${size}`}
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: "wrap",
                  gap: 0.5,
                  py: 0.5,
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&:last-of-type": {borderBottom: "none"},
                }}
              >
                <Box sx={{minWidth: 0, overflowWrap: "anywhere"}}>
                  <MonoText>{price}</MonoText>
                </Box>
                <Box
                  sx={{
                    minWidth: 0,
                    overflowWrap: "anywhere",
                    textAlign: "right",
                  }}
                >
                  <MonoText>{size}</MonoText>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{mb: 1}}>
      <Typography
        variant="subtitle2"
        sx={{mb: 0.5, color: theme.palette[color].main}}
      >
        {label} ({prices.length})
      </Typography>
      <TableContainer sx={{maxWidth: "100%"}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <GeneralTableHeaderCell header="Price" />
              <GeneralTableHeaderCell header="Size" />
            </TableRow>
          </TableHead>
          <TableBody>
            {prices.map((price, i) => {
              const size = sizes[i] ?? "—";
              return (
                <GeneralTableRow key={`${price}-${size}`}>
                  <GeneralTableCell>
                    <MonoText>{price}</MonoText>
                  </GeneralTableCell>
                  <GeneralTableCell>
                    <MonoText>{size}</MonoText>
                  </GeneralTableCell>
                </GeneralTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function BulkOrderPlacedEventView({data}: {data: Record<string, unknown>}) {
  const bidPrices = (data.bid_prices as string[]) ?? [];
  const bidSizes = (data.bid_sizes as string[]) ?? [];
  const askPrices = (data.ask_prices as string[]) ?? [];
  const askSizes = (data.ask_sizes as string[]) ?? [];
  const cancelledBidPrices = (data.cancelled_bid_prices as string[]) ?? [];
  const cancelledBidSizes = (data.cancelled_bid_sizes as string[]) ?? [];
  const cancelledAskPrices = (data.cancelled_ask_prices as string[]) ?? [];
  const cancelledAskSizes = (data.cancelled_ask_sizes as string[]) ?? [];

  return (
    <EventTable rawData={data}>
      <Row label="Market">
        <MarketValue hash={String(data.market)} />
      </Row>
      <Row label="Order ID">
        <MonoText>{String(data.order_id)}</MonoText>
      </Row>
      <Row label="User">
        <AddressValue hash={String(data.user)} />
      </Row>
      <Row label="Sequence">
        <MonoText>
          {String(data.sequence_number)}{" "}
          {data.previous_seq_num !== undefined && (
            <Typography component="span" variant="body2" color="text.secondary">
              (prev: {String(data.previous_seq_num)})
            </Typography>
          )}
        </MonoText>
      </Row>
      <Row label="Bids">
        <PriceSizeTable
          label="Bids"
          prices={bidPrices}
          sizes={bidSizes}
          color="success"
        />
      </Row>
      <Row label="Asks">
        <PriceSizeTable
          label="Asks"
          prices={askPrices}
          sizes={askSizes}
          color="error"
        />
      </Row>
      {cancelledBidPrices.length > 0 && (
        <Row label="Cancelled Bids">
          <PriceSizeTable
            label="Cancelled Bids"
            prices={cancelledBidPrices}
            sizes={cancelledBidSizes}
            color="success"
          />
        </Row>
      )}
      {cancelledAskPrices.length > 0 && (
        <Row label="Cancelled Asks">
          <PriceSizeTable
            label="Cancelled Asks"
            prices={cancelledAskPrices}
            sizes={cancelledAskSizes}
            color="error"
          />
        </Row>
      )}
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// BulkOrderFilledEvent
// ---------------------------------------------------------------------------

function BulkOrderFilledEventView({data}: {data: Record<string, unknown>}) {
  const isBid = data.is_bid === true;

  return (
    <EventTable rawData={data}>
      <Row label="Side">
        <SideLabel isBid={isBid} />
      </Row>
      <Row label="Market">
        <MarketValue hash={String(data.market)} />
      </Row>
      <Row label="Price">
        <MonoText>{String(data.price)}</MonoText>
      </Row>
      {"orig_price" in data && data.orig_price ? (
        <Row label="Original Price">
          <MonoText>{String(data.orig_price)}</MonoText>
        </Row>
      ) : null}
      <Row label="Filled Size">
        <MonoText>{String(data.filled_size)}</MonoText>
      </Row>
      <Row label="Order ID">
        <MonoText>{String(data.order_id)}</MonoText>
      </Row>
      <Row label="Fill ID">
        <MonoText>{String(data.fill_id)}</MonoText>
      </Row>
      <Row label="User">
        <AddressValue hash={String(data.user)} />
      </Row>
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// TradeEvent
// ---------------------------------------------------------------------------

function TradeEventView({data}: {data: Record<string, unknown>}) {
  const action = extractVariant(data.action);
  const market = extractInner(data.market);
  const source = extractVariant(data.source);

  return (
    <EventTable rawData={data}>
      {action && (
        <Row label="Action">
          <Chip label={action} size="small" variant="outlined" />
          {data.is_taker === true && (
            <Chip label="Taker" size="small" variant="outlined" sx={{ml: 1}} />
          )}
        </Row>
      )}
      {market && (
        <Row label="Market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row label="Price">
        <MonoText>{String(data.price)}</MonoText>
      </Row>
      <Row label="Size">
        <MonoText>{String(data.size)}</MonoText>
      </Row>
      <Row label="Fee">
        <MonoText>{String(data.fee)}</MonoText>
      </Row>
      <Row label="Account">
        <AddressValue hash={String(data.account)} />
      </Row>
      {data.realized_pnl !== undefined && String(data.realized_pnl) !== "0" && (
        <Row label="Realized PnL">
          <MonoText>{String(data.realized_pnl)}</MonoText>
        </Row>
      )}
      {source && <Row label="Source">{source}</Row>}
      <Row label="Fill ID">
        <MonoText>{String(data.fill_id)}</MonoText>
      </Row>
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// CollateralBalanceChangeEvent
// ---------------------------------------------------------------------------

function CollateralBalanceChangeEventView({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const assetInner = extractInner(data.asset_type);
  const changeType = extractVariant(data.change_type);
  const balanceType = data.balance_type as Record<string, unknown> | undefined;
  const balVariant = balanceType ? extractVariant(balanceType) : undefined;
  const account =
    balanceType && typeof balanceType.account === "string"
      ? balanceType.account
      : undefined;
  const balMarket = balanceType ? extractInner(balanceType.market) : undefined;

  return (
    <EventTable rawData={data}>
      {changeType && (
        <Row label="Change Type">
          <Chip label={changeType} size="small" variant="outlined" />
        </Row>
      )}
      <Row label="Delta">
        <MonoText>{String(data.delta)}</MonoText>
      </Row>
      {assetInner && (
        <Row label="Asset">
          <ObjectValue hash={assetInner} />
        </Row>
      )}
      {balVariant && <Row label="Balance Type">{balVariant}</Row>}
      {account && (
        <Row label="Account">
          <AddressValue hash={account} />
        </Row>
      )}
      {balMarket && (
        <Row label="Market">
          <MarketValue hash={balMarket} />
        </Row>
      )}
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// PositionUpdateEvent
// ---------------------------------------------------------------------------

function PositionUpdateEventView({data}: {data: Record<string, unknown>}) {
  const market = extractInner(data.market);

  return (
    <EventTable rawData={data}>
      <Row label="User">
        <AddressValue hash={String(data.user)} />
      </Row>
      {market && (
        <Row label="Market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row label="Side">
        <SideLabel isBid={data.is_long === true} />
        {data.is_isolated === true && (
          <Chip label="Isolated" size="small" variant="outlined" sx={{ml: 1}} />
        )}
      </Row>
      <Row label="Size">
        <MonoText>{String(data.size)}</MonoText>
      </Row>
      <Row label="Leverage">
        <MonoText>{String(data.user_leverage)}x</MonoText>
      </Row>
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// OpenInterestUpdateEvent
// ---------------------------------------------------------------------------

function OpenInterestUpdateEventView({data}: {data: Record<string, unknown>}) {
  const market = extractInner(data.market);

  return (
    <EventTable rawData={data}>
      {market && (
        <Row label="Market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row label="Current Open Interest">
        <MonoText>{String(data.current_open_interest)}</MonoText>
      </Row>
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// PriceUpdateEvent
// ---------------------------------------------------------------------------

const FUNDING_LABELS: Record<string, string> = {
  funding_index: "Funding Index",
  funding_period_us: "Funding Period",
  funding_timestamp_us: "Funding Timestamp",
  instant_daily_funding_rate: "Daily Funding Rate",
  outstanding_funding: "Outstanding Funding",
  outstanding_funding_timestamp_us: "Outstanding Timestamp",
};

function FundingView({funding}: {funding: Record<string, unknown>}) {
  const entries = Object.entries(funding).filter(
    ([key]) => key !== "__variant__",
  );
  return (
    <Stack spacing={0.75}>
      {entries.map(([key, value]) => (
        <Stack
          key={key}
          direction={{xs: "column", sm: "row"}}
          spacing={{xs: 0.25, sm: 1}}
          sx={{alignItems: {xs: "stretch", sm: "baseline"}}}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{minWidth: {xs: 0, sm: 140}, flexShrink: 0}}
          >
            {FUNDING_LABELS[key] ?? key}
          </Typography>
          <Box
            sx={{
              minWidth: 0,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            <MonoText>{String(value)}</MonoText>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function PriceUpdateEventView({data}: {data: Record<string, unknown>}) {
  const market =
    typeof data.market === "string" ? data.market : extractInner(data.market);

  return (
    <EventTable rawData={data}>
      {market && (
        <Row label="Market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row label="Oracle Price">
        <MonoText>{String(data.oracle_px)}</MonoText>
      </Row>
      <Row label="Mark Price">
        <MonoText>{String(data.mark_px)}</MonoText>
      </Row>
      {data.impact_bid_px !== undefined && (
        <Row label="Impact Bid">
          <MonoText>{String(data.impact_bid_px)}</MonoText>
        </Row>
      )}
      {data.impact_ask_px !== undefined && (
        <Row label="Impact Ask">
          <MonoText>{String(data.impact_ask_px)}</MonoText>
        </Row>
      )}
      {data.funding !== undefined &&
      typeof data.funding === "object" &&
      data.funding !== null ? (
        <Row label="Funding">
          <FundingView funding={data.funding as Record<string, unknown>} />
        </Row>
      ) : data.funding !== undefined ? (
        <Row label="Funding">
          <MonoText>{String(data.funding)}</MonoText>
        </Row>
      ) : null}
    </EventTable>
  );
}
