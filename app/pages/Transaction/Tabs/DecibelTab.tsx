import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type * as React from "react";
import type {Types} from "~/types/aptos";
import {useGetAssetMetadata} from "../../../api/hooks/useGetAssetMetadata";
import {
  type CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import type {
  DecibelDeposit,
  DecibelOrder,
  DecibelWithdraw,
} from "../../../utils/decibel";
import {
  ORDER_TYPE_EMOJIS,
  ORDER_TYPE_LABELS,
  parseDecibelTransaction,
} from "../../../utils/decibel";
import {findCoinData} from "../utils";

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
  const displayAmount = Number(amount) / 10 ** decimals;

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

function humanizeFunctionName(fnName: string): string {
  return fnName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Orders Section
// ---------------------------------------------------------------------------

function OrderRow({order}: {order: DecibelOrder}) {
  const emoji = ORDER_TYPE_EMOJIS[order.orderType] ?? "";
  const label = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;

  return (
    <GeneralTableRow>
      <GeneralTableCell>
        {emoji} {label}
      </GeneralTableCell>
      <GeneralTableCell>
        <SideChip side={order.side} />
      </GeneralTableCell>
      <GeneralTableCell>
        <HashButton hash={order.market} type={HashType.OBJECT} size="small" />
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
        {order.subaccount ? (
          <HashButton
            hash={order.subaccount}
            type={HashType.ACCOUNT}
            size="small"
          />
        ) : (
          "—"
        )}
      </GeneralTableCell>
      <GeneralTableCell>
        {order.orderId ? (
          <Typography
            variant="body2"
            sx={{
              maxWidth: 150,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={order.orderId}
          >
            {order.orderId}
          </Typography>
        ) : (
          "—"
        )}
      </GeneralTableCell>
    </GeneralTableRow>
  );
}

function OrderCard({order}: {order: DecibelOrder}) {
  const emoji = ORDER_TYPE_EMOJIS[order.orderType] ?? "";
  const label = ORDER_TYPE_LABELS[order.orderType] ?? order.orderType;

  return (
    <Paper sx={{p: 2, mb: 1.5}}>
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">
            {emoji} {label}
          </Typography>
          <SideChip side={order.side} />
        </Stack>
        <KeyValue label="Market">
          <HashButton hash={order.market} type={HashType.OBJECT} size="small" />
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
            <Typography variant="body2" sx={{wordBreak: "break-all"}}>
              {order.orderId}
            </Typography>
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
        <HashButton
          hash={deposit.subaccount}
          type={HashType.ACCOUNT}
          size="small"
        />
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
        <Typography variant="subtitle2">📥 Deposit</Typography>
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
        <HashButton
          hash={withdraw.subaccount}
          type={HashType.ACCOUNT}
          size="small"
        />
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
        <Typography variant="subtitle2">📤 Withdraw</Typography>
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
