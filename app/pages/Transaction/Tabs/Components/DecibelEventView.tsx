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
import {useTranslation} from "../../../../i18n";

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
  const {t} = useTranslation();

  return (
    <Paper variant="outlined" sx={{overflow: "hidden", maxWidth: "100%"}}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
          px: 1,
          pt: 0.5,
        }}
      >
        <Tooltip
          title={showRaw ? t("decibel.formattedView") : t("decibel.rawJson")}
        >
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
  const {t} = useTranslation();
  return (
    <Chip
      label={isBid ? t("decibel.buy") : t("decibel.sell")}
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
        alignItems: {xs: "flex-start", sm: "center"},
        width: "100%",
        minWidth: 0,
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
  const {t} = useTranslation();
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
      <Row labelKey="decibel.side">
        <SideLabel isBid={isBid} />
        {data.is_taker === true && (
          <Chip
            label={t("decibel.taker")}
            size="small"
            variant="outlined"
            sx={{ml: 1}}
          />
        )}
      </Row>
      <Row labelKey="decibel.market">
        <MarketValue hash={String(data.market)} />
      </Row>
      <Row labelKey="decibel.price">
        <MonoText>{String(data.price)}</MonoText>
      </Row>
      <Row labelKey="decibel.originalSize">
        <MonoText>{String(data.orig_size)}</MonoText>
      </Row>
      {data.remaining_size !== undefined && (
        <Row labelKey="decibel.remainingSize">
          <MonoText>{String(data.remaining_size)}</MonoText>
        </Row>
      )}
      {data.size_delta !== undefined && (
        <Row labelKey="decibel.sizeDelta">
          <MonoText>{String(data.size_delta)}</MonoText>
        </Row>
      )}
      {status && (
        <Row labelKey="decibel.status">
          <Chip label={status} size="small" variant="outlined" />
        </Row>
      )}
      {tif && <Row labelKey="decibel.timeInForce">{tif}</Row>}
      {cancelReason && (
        <Row labelKey="decibel.cancelReason">{cancelReason}</Row>
      )}
      <Row labelKey="decibel.orderId">
        <MonoText>{String(data.order_id)}</MonoText>
      </Row>
      <Row labelKey="decibel.user">
        <AddressValue hash={String(data.user)} />
      </Row>
      {"parent" in data && data.parent ? (
        <Row labelKey="decibel.parent">
          <AddressValue hash={String(data.parent)} />
        </Row>
      ) : null}
      {clientOrderId && (
        <Row labelKey="decibel.clientOrderId">
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
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  gap: 0.5,
                  py: 0.5,
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
              <GeneralTableHeaderCell headerKey="table.price" />
              <GeneralTableHeaderCell headerKey="table.size" />
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
  const {t, formatIntegerString} = useTranslation();
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
      <Row labelKey="decibel.market">
        <MarketValue hash={String(data.market)} />
      </Row>
      <Row labelKey="decibel.orderId">
        <MonoText>{String(data.order_id)}</MonoText>
      </Row>
      <Row labelKey="decibel.user">
        <AddressValue hash={String(data.user)} />
      </Row>
      <Row labelKey="decibel.sequence">
        <MonoText>{formatIntegerString(String(data.sequence_number))}</MonoText>
      </Row>
      <Row labelKey="decibel.bids">
        <PriceSizeTable
          label={t("decibel.bids")}
          prices={bidPrices}
          sizes={bidSizes}
          color="success"
        />
      </Row>
      <Row labelKey="decibel.asks">
        <PriceSizeTable
          label={t("decibel.asks")}
          prices={askPrices}
          sizes={askSizes}
          color="error"
        />
      </Row>
      {cancelledBidPrices.length > 0 && (
        <Row labelKey="decibel.cancelledBids">
          <PriceSizeTable
            label={t("decibel.cancelledBids")}
            prices={cancelledBidPrices}
            sizes={cancelledBidSizes}
            color="success"
          />
        </Row>
      )}
      {cancelledAskPrices.length > 0 && (
        <Row labelKey="decibel.cancelledAsks">
          <PriceSizeTable
            label={t("decibel.cancelledAsks")}
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
      <Row labelKey="decibel.side">
        <SideLabel isBid={isBid} />
      </Row>
      <Row labelKey="decibel.market">
        <MarketValue hash={String(data.market)} />
      </Row>
      <Row labelKey="decibel.price">
        <MonoText>{String(data.price)}</MonoText>
      </Row>
      {"orig_price" in data && data.orig_price ? (
        <Row labelKey="decibel.originalPrice">
          <MonoText>{String(data.orig_price)}</MonoText>
        </Row>
      ) : null}
      <Row labelKey="decibel.filledSize">
        <MonoText>{String(data.filled_size)}</MonoText>
      </Row>
      <Row labelKey="decibel.orderId">
        <MonoText>{String(data.order_id)}</MonoText>
      </Row>
      <Row labelKey="decibel.fillId">
        <MonoText>{String(data.fill_id)}</MonoText>
      </Row>
      <Row labelKey="decibel.user">
        <AddressValue hash={String(data.user)} />
      </Row>
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// TradeEvent
// ---------------------------------------------------------------------------

function TradeEventView({data}: {data: Record<string, unknown>}) {
  const {t} = useTranslation();
  const action = extractVariant(data.action);
  const market = extractInner(data.market);
  const source = extractVariant(data.source);

  return (
    <EventTable rawData={data}>
      {action && (
        <Row labelKey="decibel.action">
          <Chip label={action} size="small" variant="outlined" />
          {data.is_taker === true && (
            <Chip
              label={t("decibel.taker")}
              size="small"
              variant="outlined"
              sx={{ml: 1}}
            />
          )}
        </Row>
      )}
      {market && (
        <Row labelKey="decibel.market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row labelKey="decibel.price">
        <MonoText>{String(data.price)}</MonoText>
      </Row>
      <Row labelKey="decibel.size">
        <MonoText>{String(data.size)}</MonoText>
      </Row>
      <Row labelKey="decibel.fee">
        <MonoText>{String(data.fee)}</MonoText>
      </Row>
      <Row labelKey="decibel.account">
        <AddressValue hash={String(data.account)} />
      </Row>
      {data.realized_pnl !== undefined && String(data.realized_pnl) !== "0" && (
        <Row labelKey="decibel.realizedPnl">
          <MonoText>{String(data.realized_pnl)}</MonoText>
        </Row>
      )}
      {source && <Row labelKey="decibel.source">{source}</Row>}
      <Row labelKey="decibel.fillId">
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
        <Row labelKey="decibel.changeType">
          <Chip label={changeType} size="small" variant="outlined" />
        </Row>
      )}
      <Row labelKey="decibel.delta">
        <MonoText>{String(data.delta)}</MonoText>
      </Row>
      {assetInner && (
        <Row labelKey="decibel.asset">
          <ObjectValue hash={assetInner} />
        </Row>
      )}
      {balVariant && <Row labelKey="decibel.balanceType">{balVariant}</Row>}
      {account && (
        <Row labelKey="decibel.account">
          <AddressValue hash={account} />
        </Row>
      )}
      {balMarket && (
        <Row labelKey="decibel.market">
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
  const {t} = useTranslation();
  const market = extractInner(data.market);

  return (
    <EventTable rawData={data}>
      <Row labelKey="decibel.user">
        <AddressValue hash={String(data.user)} />
      </Row>
      {market && (
        <Row labelKey="decibel.market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row labelKey="decibel.side">
        <SideLabel isBid={data.is_long === true} />
        {data.is_isolated === true && (
          <Chip
            label={t("decibel.isolated")}
            size="small"
            variant="outlined"
            sx={{ml: 1}}
          />
        )}
      </Row>
      <Row labelKey="decibel.size">
        <MonoText>{String(data.size)}</MonoText>
      </Row>
      <Row labelKey="decibel.leverage">
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
        <Row labelKey="decibel.market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row labelKey="decibel.currentOpenInterest">
        <MonoText>{String(data.current_open_interest)}</MonoText>
      </Row>
    </EventTable>
  );
}

// ---------------------------------------------------------------------------
// PriceUpdateEvent
// ---------------------------------------------------------------------------

const FUNDING_LABELS: Record<string, string> = {
  funding_index: "decibel.fundingIndex",
  funding_period_us: "decibel.fundingPeriod",
  funding_timestamp_us: "decibel.fundingTimestamp",
  instant_daily_funding_rate: "decibel.dailyFundingRate",
  outstanding_funding: "decibel.outstandingFunding",
  outstanding_funding_timestamp_us: "decibel.outstandingTimestamp",
};

function FundingView({funding}: {funding: Record<string, unknown>}) {
  const {t} = useTranslation();
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
          sx={{
            alignItems: {xs: "stretch", sm: "baseline"},
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              minWidth: {xs: 0, sm: 140},
              flexShrink: 0,
            }}
          >
            {FUNDING_LABELS[key] ? t(FUNDING_LABELS[key]) : key}
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
        <Row labelKey="decibel.market">
          <MarketValue hash={market} />
        </Row>
      )}
      <Row labelKey="decibel.oraclePrice">
        <MonoText>{String(data.oracle_px)}</MonoText>
      </Row>
      <Row labelKey="decibel.markPrice">
        <MonoText>{String(data.mark_px)}</MonoText>
      </Row>
      {data.impact_bid_px !== undefined && (
        <Row labelKey="decibel.impactBid">
          <MonoText>{String(data.impact_bid_px)}</MonoText>
        </Row>
      )}
      {data.impact_ask_px !== undefined && (
        <Row labelKey="decibel.impactAsk">
          <MonoText>{String(data.impact_ask_px)}</MonoText>
        </Row>
      )}
      {data.funding !== undefined &&
      typeof data.funding === "object" &&
      data.funding !== null ? (
        <Row labelKey="decibel.funding">
          <FundingView funding={data.funding as Record<string, unknown>} />
        </Row>
      ) : data.funding !== undefined ? (
        <Row labelKey="decibel.funding">
          <MonoText>{String(data.funding)}</MonoText>
        </Row>
      ) : null}
    </EventTable>
  );
}
