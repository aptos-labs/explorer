import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import * as React from "react";
import type {Types} from "~/types/aptos";
import {useGetAssetMetadata} from "../../../api/hooks/useGetAssetMetadata";
import {
  type CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import {
  type DecibelMarketConfig,
  useGetDecibelMarketConfig,
  useGetDecibelMarketName,
} from "../../../api/hooks/useGetDecibelMarketName";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import {isValidAccountAddress} from "../../../utils";
import type {
  BulkOrderLeg,
  DecibelBulkOrderDetail,
  DecibelBulkOrderFilledEvent,
  DecibelBulkOrderPlacedEvent,
  DecibelDeposit,
  DecibelOrder,
  DecibelTransactionSummary,
  DecibelWithdraw,
} from "../../../utils/decibel";
import {
  ORDER_TYPE_LABELS,
  parseDecibelTransaction,
} from "../../../utils/decibel";
import {findCoinData} from "../utils";

const ORDER_TYPE_ICONS: Record<string, React.ReactElement> = {
  limit: <ListAltOutlinedIcon fontSize="small" />,
  market: <FlashOnOutlinedIcon fontSize="small" />,
  cancel: <CancelOutlinedIcon fontSize="small" />,
  bulk: <ViewInArOutlinedIcon fontSize="small" />,
  twap: <ScheduleOutlinedIcon fontSize="small" />,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SideChip({side}: {side: "buy" | "sell" | undefined}) {
  if (!side) return null;
  return (
    <Chip
      label={side === "buy" ? "Buy" : "Sell"}
      size="small"
      color={side === "buy" ? "success" : "error"}
      sx={{fontWeight: 600}}
    />
  );
}

function TruncatedCopyId({value}: {value: string}) {
  const [copied, setCopied] = React.useState(false);
  const truncated =
    value.length > 8 ? `${value.slice(0, 4)}…${value.slice(-4)}` : value;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip title={copied ? "Copied!" : value} arrow>
      <ButtonBase
        onClick={handleCopy}
        aria-label={`Copy ${value}`}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          borderRadius: 0.5,
          px: 0.5,
        }}
      >
        <Typography
          variant="body2"
          component="span"
          sx={{fontFamily: "monospace"}}
        >
          {truncated}
        </Typography>
        <ContentCopyIcon sx={{fontSize: 14, opacity: 0.6}} />
      </ButtonBase>
    </Tooltip>
  );
}

function AmountWithAsset({
  asset,
  amount,
  coinData,
}: {
  asset: string;
  amount: string;
  coinData: CoinDescription[] | undefined;
}) {
  const {data: assetMetadata} = useGetAssetMetadata(asset);
  const assetCoin = findCoinData(coinData, asset);
  const decimals = assetCoin?.decimals ?? assetMetadata?.decimals ?? 0;
  const displayAmount = getFormattedBalanceStr(amount, decimals);

  return (
    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
      <Typography variant="body2" component="span">
        {displayAmount}
      </Typography>
      <HashButton
        hash={asset}
        type={asset.includes("::") ? HashType.COIN : HashType.FUNGIBLE_ASSET}
        img={assetCoin?.logoUrl}
        size="small"
      />
    </Stack>
  );
}

function MarketValue({hash}: {hash: string}) {
  const {data: name} = useGetDecibelMarketName(hash);
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {name && (
        <Typography variant="body2" sx={{fontWeight: 600}}>
          {name}
        </Typography>
      )}
      <HashButton hash={hash} type={HashType.OBJECT} size="small" />
    </Stack>
  );
}

function SafeAccountLink({hash}: {hash: string}) {
  if (isValidAccountAddress(hash)) {
    return <HashButton hash={hash} type={HashType.ACCOUNT} size="small" />;
  }
  return (
    <Typography variant="body2" sx={{fontFamily: "monospace"}}>
      {hash}
    </Typography>
  );
}

function humanizeFunctionName(fnName: string): string {
  return fnName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDecibelPrice(
  raw: string,
  config: DecibelMarketConfig | undefined,
): string {
  const decimals = config?.priceDecimals ?? 6;
  const formatted = getFormattedBalanceStr(raw, decimals);
  const quote = config?.quoteAsset;
  if (quote === "USD" || quote === "USDC") return `$${formatted}`;
  if (quote) return `${formatted} ${quote}`;
  return formatted;
}

function formatDecibelSize(
  raw: string,
  config: DecibelMarketConfig | undefined,
): string {
  const decimals = config?.szDecimals ?? 0;
  const formatted = getFormattedBalanceStr(raw, decimals);
  const base = config?.baseAsset;
  if (base) return `${formatted} ${base}`;
  return formatted;
}

function MonoText({children}: {children: React.ReactNode}) {
  return (
    <Typography variant="body2" sx={{fontFamily: "monospace"}}>
      {children}
    </Typography>
  );
}

function KeyValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{minWidth: 100, flexShrink: 0}}
      >
        {label}
      </Typography>
      <Box sx={{flex: 1, minWidth: 0}}>{children}</Box>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Bulk Order Ladder Table
// ---------------------------------------------------------------------------

function LegTable({
  legs,
  label,
  color,
  isMobile,
  marketConfig,
}: {
  legs: BulkOrderLeg[];
  label: string;
  color: "success" | "error";
  isMobile: boolean;
  marketConfig: DecibelMarketConfig | undefined;
}) {
  const theme = useTheme();
  if (legs.length === 0) return null;

  const formattedLegs = legs.map((leg) => ({
    price: formatDecibelPrice(leg.price, marketConfig),
    size: formatDecibelSize(leg.size, marketConfig),
  }));

  let totalRawSize = BigInt(0);
  try {
    for (const leg of legs) {
      totalRawSize += BigInt(leg.size);
    }
  } catch {
    totalRawSize = BigInt(0);
  }
  const totalSize =
    totalRawSize > BigInt(0)
      ? formatDecibelSize(String(totalRawSize), marketConfig)
      : undefined;

  if (isMobile) {
    return (
      <Box sx={{mb: 1}}>
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{mb: 1}}>
          <Typography
            variant="subtitle2"
            sx={{color: theme.palette[color].main}}
          >
            {label} ({legs.length})
          </Typography>
          {totalSize && (
            <Typography variant="caption" color="text.secondary">
              Total: {totalSize}
            </Typography>
          )}
        </Stack>
        <Stack spacing={0.5}>
          {formattedLegs.map((leg, i) => (
            <Stack
              // biome-ignore lint/suspicious/noArrayIndexKey: legs may share identical price-size pairs
              key={`${leg.price}-${leg.size}-${i}`}
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              sx={{
                py: 0.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                "&:last-of-type": {borderBottom: "none"},
              }}
            >
              <MonoText>{leg.price}</MonoText>
              <MonoText>{leg.size}</MonoText>
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{mb: 1}}>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{mb: 0.5}}>
        <Typography variant="subtitle2" sx={{color: theme.palette[color].main}}>
          {label} ({legs.length})
        </Typography>
        {totalSize && (
          <Typography variant="caption" color="text.secondary">
            Total size: {totalSize}
          </Typography>
        )}
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <GeneralTableHeaderCell header="#" />
            <GeneralTableHeaderCell
              header={
                marketConfig?.quoteAsset
                  ? `Price (${marketConfig.quoteAsset})`
                  : "Price"
              }
            />
            <GeneralTableHeaderCell
              header={
                marketConfig?.baseAsset
                  ? `Size (${marketConfig.baseAsset})`
                  : "Size"
              }
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {formattedLegs.map((leg, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: legs may share identical price-size pairs
            <GeneralTableRow key={`${leg.price}-${leg.size}-${i}`}>
              <GeneralTableCell>
                <Typography variant="body2" color="text.secondary">
                  {i + 1}
                </Typography>
              </GeneralTableCell>
              <GeneralTableCell>
                <MonoText>{leg.price}</MonoText>
              </GeneralTableCell>
              <GeneralTableCell>
                <MonoText>{leg.size}</MonoText>
              </GeneralTableCell>
            </GeneralTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Inline Bulk Order Detail (expandable under bulk order row)
// ---------------------------------------------------------------------------

function FillsDesktopTable({
  fills,
  marketConfig,
}: {
  fills: DecibelBulkOrderFilledEvent[];
  marketConfig: DecibelMarketConfig | undefined;
}) {
  const hasOrigPrice = fills.some((f) => f.origPrice != null);
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="Side" />
          <GeneralTableHeaderCell header="Price" />
          <GeneralTableHeaderCell header="Filled Size" />
          {hasOrigPrice && <GeneralTableHeaderCell header="Orig Price" />}
          <GeneralTableHeaderCell header="Order ID" />
          <GeneralTableHeaderCell header="Fill ID" />
          <GeneralTableHeaderCell header="User" />
        </TableRow>
      </TableHead>
      <TableBody>
        {fills.map((fill, i) => (
          <GeneralTableRow
            // biome-ignore lint/suspicious/noArrayIndexKey: fills lack a guaranteed unique identifier
            key={`fill-${fill.fillId}-${i}`}
          >
            <GeneralTableCell>
              <SideChip side={fill.side} />
            </GeneralTableCell>
            <GeneralTableCell>
              <MonoText>
                {formatDecibelPrice(fill.price, marketConfig)}
              </MonoText>
            </GeneralTableCell>
            <GeneralTableCell>
              <MonoText>
                {formatDecibelSize(fill.filledSize, marketConfig)}
              </MonoText>
            </GeneralTableCell>
            {hasOrigPrice && (
              <GeneralTableCell>
                {fill.origPrice ? (
                  <MonoText>
                    {formatDecibelPrice(fill.origPrice, marketConfig)}
                  </MonoText>
                ) : (
                  "—"
                )}
              </GeneralTableCell>
            )}
            <GeneralTableCell>
              <TruncatedCopyId value={fill.orderId} />
            </GeneralTableCell>
            <GeneralTableCell>
              <TruncatedCopyId value={fill.fillId} />
            </GeneralTableCell>
            <GeneralTableCell>
              <SafeAccountLink hash={fill.user} />
            </GeneralTableCell>
          </GeneralTableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BulkOrderInlineDetail({
  detail,
  placedEvents,
  filledEvents,
  marketConfig,
}: {
  detail: DecibelBulkOrderDetail | undefined;
  placedEvents: DecibelBulkOrderPlacedEvent[];
  filledEvents: DecibelBulkOrderFilledEvent[];
  marketConfig: DecibelMarketConfig | undefined;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const hasDetail = detail !== undefined;
  const hasPlaced = placedEvents.length > 0;
  const hasFills = filledEvents.length > 0;

  const [expanded, setExpanded] = React.useState(false);

  if (!hasDetail && !hasPlaced && !hasFills) return null;

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      sx={{
        "&::before": {display: "none"},
        backgroundColor: "transparent",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label={
          expanded ? "Hide bulk order details" : "Show bulk order details"
        }
        sx={{
          minHeight: 36,
          px: 0,
          "& .MuiAccordionSummary-content": {my: 0.5},
        }}
      >
        <Typography variant="body2" color="primary" sx={{fontWeight: 600}}>
          {expanded ? "Hide details" : "Show details"}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{px: 0, pt: 0}}>
        <Stack spacing={2.5}>
          {/* Payload-level detail */}
          {detail && (
            <Box>
              <Typography variant="subtitle2" sx={{mb: 1}}>
                Submitted Order
              </Typography>
              <Paper variant="outlined" sx={{p: 2}}>
                <Stack spacing={1.5}>
                  {detail.sequenceNumber && (
                    <KeyValue label="Sequence #">
                      <MonoText>{detail.sequenceNumber}</MonoText>
                    </KeyValue>
                  )}
                  {detail.builderAddress && (
                    <KeyValue label="Builder">
                      <SafeAccountLink hash={detail.builderAddress} />
                    </KeyValue>
                  )}
                  {detail.builderFees && (
                    <KeyValue label="Builder Fee">
                      <MonoText>{detail.builderFees}</MonoText>
                    </KeyValue>
                  )}
                  <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={2}
                    sx={{mt: 1}}
                  >
                    <Box sx={{flex: 1}}>
                      <LegTable
                        legs={detail.bids}
                        label="Bids"
                        color="success"
                        isMobile={isMobile}
                        marketConfig={marketConfig}
                      />
                    </Box>
                    <Box sx={{flex: 1}}>
                      <LegTable
                        legs={detail.asks}
                        label="Asks"
                        color="error"
                        isMobile={isMobile}
                        marketConfig={marketConfig}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Placed events */}
          {hasPlaced && (
            <Box>
              <Typography variant="subtitle2" sx={{mb: 1}}>
                Placed{" "}
                {placedEvents.length > 1 ? `(${placedEvents.length})` : ""}
              </Typography>
              <Stack spacing={1.5}>
                {placedEvents.map((evt, idx) => (
                  <Paper
                    // biome-ignore lint/suspicious/noArrayIndexKey: events lack a guaranteed unique identifier
                    key={`placed-${evt.orderId}-${idx}`}
                    variant="outlined"
                    sx={{p: 2}}
                  >
                    <Stack spacing={1.5}>
                      <KeyValue label="Order ID">
                        <TruncatedCopyId value={evt.orderId} />
                      </KeyValue>
                      <KeyValue label="User">
                        <SafeAccountLink hash={evt.user} />
                      </KeyValue>
                      <KeyValue label="Sequence #">
                        <MonoText>{evt.sequenceNumber}</MonoText>
                      </KeyValue>
                      <Stack
                        direction={isMobile ? "column" : "row"}
                        spacing={2}
                        sx={{mt: 1}}
                      >
                        <Box sx={{flex: 1}}>
                          <LegTable
                            legs={evt.bids}
                            label="Bids"
                            color="success"
                            isMobile={isMobile}
                            marketConfig={marketConfig}
                          />
                        </Box>
                        <Box sx={{flex: 1}}>
                          <LegTable
                            legs={evt.asks}
                            label="Asks"
                            color="error"
                            isMobile={isMobile}
                            marketConfig={marketConfig}
                          />
                        </Box>
                      </Stack>
                      {(evt.cancelledBids.length > 0 ||
                        evt.cancelledAsks.length > 0) && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{mb: 1}}
                          >
                            Cancelled Orders
                          </Typography>
                          <Stack
                            direction={isMobile ? "column" : "row"}
                            spacing={2}
                          >
                            <Box sx={{flex: 1}}>
                              <LegTable
                                legs={evt.cancelledBids}
                                label="Cancelled Bids"
                                color="success"
                                isMobile={isMobile}
                                marketConfig={marketConfig}
                              />
                            </Box>
                            <Box sx={{flex: 1}}>
                              <LegTable
                                legs={evt.cancelledAsks}
                                label="Cancelled Asks"
                                color="error"
                                isMobile={isMobile}
                                marketConfig={marketConfig}
                              />
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Filled events */}
          {hasFills && (
            <Box>
              <Typography variant="subtitle2" sx={{mb: 1}}>
                Fills ({filledEvents.length})
              </Typography>
              {isMobile ? (
                <Stack spacing={1}>
                  {filledEvents.map((fill, i) => (
                    <Paper
                      // biome-ignore lint/suspicious/noArrayIndexKey: fills lack a guaranteed unique identifier
                      key={`fill-${fill.fillId}-${i}`}
                      variant="outlined"
                      sx={{p: 1.5}}
                    >
                      <Stack spacing={0.75}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2" fontWeight={600}>
                            Fill
                          </Typography>
                          <SideChip side={fill.side} />
                        </Stack>
                        <KeyValue label="Price">
                          <MonoText>
                            {formatDecibelPrice(fill.price, marketConfig)}
                          </MonoText>
                        </KeyValue>
                        <KeyValue label="Size">
                          <MonoText>
                            {formatDecibelSize(fill.filledSize, marketConfig)}
                          </MonoText>
                        </KeyValue>
                        {fill.origPrice != null && (
                          <KeyValue label="Orig Price">
                            <MonoText>
                              {formatDecibelPrice(fill.origPrice, marketConfig)}
                            </MonoText>
                          </KeyValue>
                        )}
                        <KeyValue label="Order ID">
                          <TruncatedCopyId value={fill.orderId} />
                        </KeyValue>
                        <KeyValue label="Fill ID">
                          <TruncatedCopyId value={fill.fillId} />
                        </KeyValue>
                        <KeyValue label="User">
                          <SafeAccountLink hash={fill.user} />
                        </KeyValue>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <FillsDesktopTable
                  fills={filledEvents}
                  marketConfig={marketConfig}
                />
              )}
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// ---------------------------------------------------------------------------
// Orders Section
// ---------------------------------------------------------------------------

function OrderRow({
  order,
  marketConfig,
}: {
  order: DecibelOrder;
  marketConfig: DecibelMarketConfig | undefined;
}) {
  const icon = ORDER_TYPE_ICONS[order.orderType] ?? null;
  const label = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;
  const formattedSize = order.size
    ? formatDecibelSize(order.size, marketConfig)
    : "—";
  const formattedPrice = order.price
    ? formatDecibelPrice(order.price, marketConfig)
    : order.orderType === "market"
      ? "Market"
      : "—";

  return (
    <GeneralTableRow>
      <GeneralTableCell>
        {icon} {label}
      </GeneralTableCell>
      <GeneralTableCell>
        <SideChip side={order.side} />
      </GeneralTableCell>
      <GeneralTableCell>
        <MarketValue hash={order.market} />
      </GeneralTableCell>
      <GeneralTableCell>{formattedSize}</GeneralTableCell>
      <GeneralTableCell>{formattedPrice}</GeneralTableCell>
      <GeneralTableCell>
        {order.status ? (
          <Chip label={order.status} size="small" variant="outlined" />
        ) : (
          "—"
        )}
      </GeneralTableCell>
      <GeneralTableCell>{order.timeInForce ?? "—"}</GeneralTableCell>
      <GeneralTableCell>
        {order.subaccount ? <SafeAccountLink hash={order.subaccount} /> : "—"}
      </GeneralTableCell>
      <GeneralTableCell>
        {order.orderId ? <TruncatedCopyId value={order.orderId} /> : "—"}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function OrderCard({
  order,
  marketConfig,
  children,
}: {
  order: DecibelOrder;
  marketConfig: DecibelMarketConfig | undefined;
  children?: React.ReactNode;
}) {
  const icon = ORDER_TYPE_ICONS[order.orderType] ?? null;
  const label = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;
  const formattedSize = order.size
    ? formatDecibelSize(order.size, marketConfig)
    : undefined;
  const formattedPrice = order.price
    ? formatDecibelPrice(order.price, marketConfig)
    : order.orderType === "market"
      ? "Market"
      : "—";

  return (
    <Paper sx={{p: 2, mb: 1.5}}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">
            {icon} {label}
          </Typography>
          <SideChip side={order.side} />
        </Stack>
        <KeyValue label="Market">
          <MarketValue hash={order.market} />
        </KeyValue>
        {formattedSize && <KeyValue label="Size">{formattedSize}</KeyValue>}
        <KeyValue label="Price">{formattedPrice}</KeyValue>
        {order.status && (
          <KeyValue label="Status">
            <Chip label={order.status} size="small" variant="outlined" />
          </KeyValue>
        )}
        {order.timeInForce && (
          <KeyValue label="Time in Force">{order.timeInForce}</KeyValue>
        )}
        {order.subaccount && (
          <KeyValue label="Subaccount">
            <HashButton
              hash={order.subaccount}
              type={HashType.ACCOUNT}
              size="small"
            />
          </KeyValue>
        )}
        {order.orderId && (
          <KeyValue label="Order ID">
            <TruncatedCopyId value={order.orderId} />
          </KeyValue>
        )}
        {children}
      </Stack>
    </Paper>
  );
}

function OrdersSection({
  orders,
  summary,
}: {
  orders: DecibelOrder[];
  summary: DecibelTransactionSummary;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const bulkMarket =
    summary.bulkOrderDetail?.market ?? orders.find((o) => o.market)?.market;
  const {data: marketConfig} = useGetDecibelMarketConfig(bulkMarket ?? "");

  if (orders.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{mb: 1.5}}>
        Orders
      </Typography>
      {isMobile ? (
        orders.map((order, i) => (
          <OrderCard
            // biome-ignore lint/suspicious/noArrayIndexKey: orders lack a guaranteed unique identifier
            key={i}
            order={order}
            marketConfig={marketConfig}
          >
            {order.orderType === "bulk" && (
              <BulkOrderInlineDetail
                detail={summary.bulkOrderDetail}
                placedEvents={summary.bulkOrderPlacedEvents}
                filledEvents={summary.bulkOrderFilledEvents}
                marketConfig={marketConfig}
              />
            )}
          </OrderCard>
        ))
      ) : (
        <Stack spacing={0}>
          <Table>
            <TableHead>
              <TableRow>
                <GeneralTableHeaderCell header="Type" />
                <GeneralTableHeaderCell header="Side" />
                <GeneralTableHeaderCell header="Market" />
                <GeneralTableHeaderCell header="Size" />
                <GeneralTableHeaderCell header="Price" />
                <GeneralTableHeaderCell header="Status" />
                <GeneralTableHeaderCell header="Time in Force" />
                <GeneralTableHeaderCell header="Subaccount" />
                <GeneralTableHeaderCell header="Order ID" />
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: orders lack a guaranteed unique identifier
                <OrderRow key={i} order={order} marketConfig={marketConfig} />
              ))}
            </TableBody>
          </Table>
          {orders.some((o) => o.orderType === "bulk") && (
            <Box sx={{mt: 1, px: 1}}>
              <BulkOrderInlineDetail
                detail={summary.bulkOrderDetail}
                placedEvents={summary.bulkOrderPlacedEvents}
                filledEvents={summary.bulkOrderFilledEvents}
                marketConfig={marketConfig}
              />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Deposits Section
// ---------------------------------------------------------------------------

function DepositRow({
  deposit,
  coinData,
}: {
  deposit: DecibelDeposit;
  coinData: CoinDescription[] | undefined;
}) {
  return (
    <GeneralTableRow>
      <GeneralTableCell>
        <AmountWithAsset
          asset={deposit.asset}
          amount={deposit.amount}
          coinData={coinData}
        />
      </GeneralTableCell>
      <GeneralTableCell>
        <SafeAccountLink hash={deposit.subaccount} />
      </GeneralTableCell>
      <GeneralTableCell>
        {humanizeFunctionName(deposit.functionName)}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function DepositCard({
  deposit,
  coinData,
}: {
  deposit: DecibelDeposit;
  coinData: CoinDescription[] | undefined;
}) {
  return (
    <Paper sx={{p: 2, mb: 1.5}}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <DownloadOutlinedIcon fontSize="small" />
          <Typography variant="subtitle2">Deposit</Typography>
        </Stack>
        <KeyValue label="Amount">
          <AmountWithAsset
            asset={deposit.asset}
            amount={deposit.amount}
            coinData={coinData}
          />
        </KeyValue>
        <KeyValue label="Subaccount">
          <HashButton
            hash={deposit.subaccount}
            type={HashType.ACCOUNT}
            size="small"
          />
        </KeyValue>
        <KeyValue label="Function">
          {humanizeFunctionName(deposit.functionName)}
        </KeyValue>
      </Stack>
    </Paper>
  );
}

function DepositsSection({
  deposits,
  coinData,
}: {
  deposits: DecibelDeposit[];
  coinData: CoinDescription[] | undefined;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (deposits.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{mb: 1.5}}>
        Deposits
      </Typography>
      {isMobile ? (
        deposits.map((d, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: deposits lack a unique identifier
          <DepositCard key={i} deposit={d} coinData={coinData} />
        ))
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <GeneralTableHeaderCell header="Asset & Amount" />
              <GeneralTableHeaderCell header="Subaccount" />
              <GeneralTableHeaderCell header="Function" />
            </TableRow>
          </TableHead>
          <TableBody>
            {deposits.map((d, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: deposits lack a unique identifier
              <DepositRow key={i} deposit={d} coinData={coinData} />
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Withdrawals Section
// ---------------------------------------------------------------------------

function WithdrawRow({
  withdraw,
  coinData,
}: {
  withdraw: DecibelWithdraw;
  coinData: CoinDescription[] | undefined;
}) {
  return (
    <GeneralTableRow>
      <GeneralTableCell>
        <AmountWithAsset
          asset={withdraw.asset}
          amount={withdraw.amount}
          coinData={coinData}
        />
      </GeneralTableCell>
      <GeneralTableCell>
        <SafeAccountLink hash={withdraw.subaccount} />
      </GeneralTableCell>
      <GeneralTableCell>
        {humanizeFunctionName(withdraw.functionName)}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function WithdrawCard({
  withdraw,
  coinData,
}: {
  withdraw: DecibelWithdraw;
  coinData: CoinDescription[] | undefined;
}) {
  return (
    <Paper sx={{p: 2, mb: 1.5}}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <UploadOutlinedIcon fontSize="small" />
          <Typography variant="subtitle2">Withdraw</Typography>
        </Stack>
        <KeyValue label="Amount">
          <AmountWithAsset
            asset={withdraw.asset}
            amount={withdraw.amount}
            coinData={coinData}
          />
        </KeyValue>
        <KeyValue label="Subaccount">
          <HashButton
            hash={withdraw.subaccount}
            type={HashType.ACCOUNT}
            size="small"
          />
        </KeyValue>
        <KeyValue label="Function">
          {humanizeFunctionName(withdraw.functionName)}
        </KeyValue>
      </Stack>
    </Paper>
  );
}

function WithdrawalsSection({
  withdrawals,
  coinData,
}: {
  withdrawals: DecibelWithdraw[];
  coinData: CoinDescription[] | undefined;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (withdrawals.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{mb: 1.5}}>
        Withdrawals
      </Typography>
      {isMobile ? (
        withdrawals.map((w, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: withdrawals lack a unique identifier
          <WithdrawCard key={i} withdraw={w} coinData={coinData} />
        ))
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <GeneralTableHeaderCell header="Asset & Amount" />
              <GeneralTableHeaderCell header="Subaccount" />
              <GeneralTableHeaderCell header="Function" />
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals.map((w, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: withdrawals lack a unique identifier
              <WithdrawRow key={i} withdraw={w} coinData={coinData} />
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main Tab
// ---------------------------------------------------------------------------

export default function DecibelTab({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  const {data: coinData} = useGetCoinList();
  const summary = parseDecibelTransaction(transaction);

  const hasContent =
    summary.orders.length > 0 ||
    summary.deposits.length > 0 ||
    summary.withdrawals.length > 0 ||
    summary.bulkOrderDetail !== undefined ||
    summary.bulkOrderPlacedEvents.length > 0 ||
    summary.bulkOrderFilledEvents.length > 0;

  if (!hasContent) {
    return (
      <ContentBox>
        <Typography color="text.secondary">
          No Decibel activity found in this transaction.
        </Typography>
      </ContentBox>
    );
  }

  return (
    <ContentBox>
      <Stack spacing={3}>
        <OrdersSection orders={summary.orders} summary={summary} />
        <DepositsSection
          deposits={summary.deposits}
          coinData={coinData?.data}
        />
        <WithdrawalsSection
          withdrawals={summary.withdrawals}
          coinData={coinData?.data}
        />
      </Stack>
    </ContentBox>
  );
}
