import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";
import {
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
import {useGetDecibelMarketName} from "../../../api/hooks/useGetDecibelMarketName";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import {isValidAccountAddress} from "../../../utils";
import type {
  DecibelDeposit,
  DecibelOrder,
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
    <Stack
      direction="row"
      spacing={1}
      sx={{alignItems: "center", flexWrap: "wrap"}}
    >
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
    <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
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

// ---------------------------------------------------------------------------
// Orders Section
// ---------------------------------------------------------------------------

function OrderRow({order}: {order: DecibelOrder}) {
  const icon = ORDER_TYPE_ICONS[order.orderType] ?? null;
  const label = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;

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
      <GeneralTableCell>{order.size ?? "—"}</GeneralTableCell>
      <GeneralTableCell>
        {order.price ?? (order.orderType === "market" ? "Market" : "—")}
      </GeneralTableCell>
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

function OrderCard({order}: {order: DecibelOrder}) {
  const icon = ORDER_TYPE_ICONS[order.orderType] ?? null;
  const label = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;

  return (
    <Paper sx={{p: 2, mb: 1.5}}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          sx={{justifyContent: "space-between", alignItems: "center"}}
        >
          <Typography variant="subtitle2">
            {icon} {label}
          </Typography>
          <SideChip side={order.side} />
        </Stack>
        <KeyValue label="Market">
          <MarketValue hash={order.market} />
        </KeyValue>
        {order.size && <KeyValue label="Size">{order.size}</KeyValue>}
        <KeyValue label="Price">
          {order.price ?? (order.orderType === "market" ? "Market" : "—")}
        </KeyValue>
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
      </Stack>
    </Paper>
  );
}

function OrdersSection({orders}: {orders: DecibelOrder[]}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (orders.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{mb: 1.5}}>
        Orders
      </Typography>
      {isMobile ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: orders lack a guaranteed unique identifier
        orders.map((order, i) => <OrderCard key={i} order={order} />)
      ) : (
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
              <OrderRow key={i} order={order} />
            ))}
          </TableBody>
        </Table>
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
        <Stack direction="row" spacing={0.5} sx={{alignItems: "center"}}>
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
        <Stack direction="row" spacing={0.5} sx={{alignItems: "center"}}>
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
// Shared
// ---------------------------------------------------------------------------

function KeyValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{alignItems: "center", flexWrap: "wrap"}}
    >
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
    summary.withdrawals.length > 0;

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
        <OrdersSection orders={summary.orders} />
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
