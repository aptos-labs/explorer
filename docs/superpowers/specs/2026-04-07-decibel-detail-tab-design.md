# Decibel Detail Tab — Design Spec

## Context

The Aptos Explorer already detects Decibel transactions and shows a brief action summary (order type, deposit/withdraw) on the transaction overview tab. However, Decibel transactions carry rich structured data — order parameters, time-in-force, fill status, subaccount details — that the current summary doesn't expose.

This feature adds a dedicated **"Decibel" tab** to the transaction detail page that parses all Decibel-related events and payload arguments into friendly, mobile-responsive tables covering perpetual orders, deposits, and withdrawals.

## Decisions

- **Approach**: Standalone tab with its own parsing module (Approach A). The existing overview tab's Decibel rendering is left untouched — no refactor of `UserTransactionOverviewTab.tsx` in this round.
- **Visibility**: Tab only appears for transactions that involve Decibel contracts. Detection via event types or payload function prefix.
- **Mobile pattern**: Card layout below `md` breakpoint, matching the existing `TransactionsTable` responsive pattern.
- **Scope**: Decibel only. No other protocol tabs in this round.

## Architecture

### New Files

```
app/
├── utils/decibel/
│   ├── constants.ts        # DECIBEL_CONTRACT addresses (mainnet + testnet), mappings
│   ├── types.ts            # DecibelOrder, DecibelDeposit, DecibelWithdraw, DecibelTransactionSummary
│   ├── parser.ts           # parseDecibelTransaction(), isDecibelTransaction()
│   └── index.ts            # Re-exports
├── pages/Transaction/Tabs/
│   └── DecibelTab.tsx      # Tab component with three responsive tables
```

### Modified Files

```
app/pages/Transaction/Tabs.tsx          # Register tab, conditional visibility
app/pages/Transaction/transactionTabMeta.ts  # Add "Decibel" head label
```

## Detection: `isDecibelTransaction(transaction)`

Returns `true` if any of:
1. Transaction events contain a type starting with `DECIBEL_CONTRACT::`
2. Transaction payload function starts with `DECIBEL_CONTRACT::`

Both mainnet and testnet contract addresses are checked.

## Parsing Module: `app/utils/decibel/`

### `constants.ts`

```ts
export const DECIBEL_CONTRACTS = [
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06", // mainnet
  "0xe7da2794b1d8af76532ed95f38bfdf1136abfd8ea3a240189971988a83101b7f", // testnet
];

export const ORDER_TYPE_LABELS = { limit: "Limit Order", market: "Market Order", cancel: "Cancel Order", bulk: "Bulk Orders", twap: "TWAP Order" };
export const ORDER_TYPE_EMOJIS = { limit: "📋", market: "⚡", cancel: "❌", bulk: "📦", twap: "⏱️" };
```

### `types.ts`

```ts
export type DecibelOrder = {
  orderType: "limit" | "market" | "cancel" | "bulk" | "twap";
  side: "buy" | "sell" | undefined;
  market: string;
  size: string | undefined;
  price: string | undefined;
  status: string | undefined;       // e.g., "FILLED", "CANCELLED", "OPEN"
  timeInForce: string | undefined;  // e.g., "GTC", "IOC", "FOK"
};

export type DecibelDeposit = {
  asset: string;
  amount: string;
  subaccount: string;
  functionName: string;  // e.g., "deposit_to_subaccount_at"
};

export type DecibelWithdraw = {
  asset: string;
  amount: string;
  subaccount: string;
  functionName: string;
};

export type DecibelTransactionSummary = {
  orders: DecibelOrder[];
  deposits: DecibelDeposit[];
  withdrawals: DecibelWithdraw[];
};
```

### `parser.ts`

- `parseDecibelTransaction(transaction: Types.Transaction): DecibelTransactionSummary`
  - Iterates all events, parses `OrderEvent` into `DecibelOrder` entries (extracts `status.__variant__`, `time_in_force.__variant__`, `is_bid`, `market`, `orig_size`, `price`)
  - Analyzes payload function name for deposit/withdraw/bulk/twap/cancel entry functions
  - Returns aggregated summary
- `isDecibelTransaction(transaction: Types.Transaction): boolean`
  - Lightweight check — scans events and payload for Decibel contract prefix

## Tab Component: `DecibelTab.tsx`

Receives `{ transaction: Types.Transaction }`.

### Sections

Three sections, each rendered only if it has data:

#### 1. Orders Table

| Column | Source | Notes |
|--------|--------|-------|
| Type | `orderType` | Emoji + label |
| Side | `side` | Green "Buy" / Red "Sell" chip |
| Market | `market` | Linked via `HashButton` |
| Size | `size` | Raw value (units TBD per market) |
| Price | `price` | "Market" for IOC/FOK orders |
| Status | `status` | Chip with color coding |
| Time in Force | `timeInForce` | GTC / IOC / FOK |

#### 2. Deposits Table

| Column | Source | Notes |
|--------|--------|-------|
| Asset | `asset` | Icon + link via `HashButton`, uses `useGetAssetMetadata` |
| Amount | `amount` | Divided by decimals for human-readable display |
| Subaccount | `subaccount` | Truncated address, linked |
| Function | `functionName` | Last segment of function path |

#### 3. Withdrawals Table

Same structure as Deposits.

### Responsive Behavior

- **Desktop (>= md)**: Standard MUI `Table` with `GeneralTableRow` / `GeneralTableCell` / `GeneralTableHeaderCell` from `app/components/Table/`
- **Mobile (< md)**: Each row becomes a `Paper` card with stacked key-value pairs. Uses `useMediaQuery(theme.breakpoints.down("md"))` to switch, matching `TransactionsTable.tsx` pattern.

### Data Hooks

- `useGetAssetMetadata(asset)` — for token decimals and metadata
- `useCoinListData()` or equivalent — for coin logos and display names
- These are existing hooks already used by the overview tab's Decibel rendering

## Tab Registration

### `Tabs.tsx` Changes

1. Import `DecibelTab` and `isDecibelTransaction`
2. Add to `TabComponents`: `decibelDetail: DecibelTab`
3. Modify `getTabValues` for `TransactionTypeName.User`:
   ```ts
   case TransactionTypeName.User: {
     const tabs: TabValue[] = ["userTxnOverview"];
     if (isDecibelTransaction(transaction)) {
       tabs.push("decibelDetail");
     }
     tabs.push("balanceChange", "events", "payload", "changes", "trace");
     return tabs;
   }
   ```
4. Add to `getTabLabel`: `case "decibelDetail": return "Decibel"`
5. Add to `getTabIcon`: `case "decibelDetail": return <ShowChartOutlined fontSize="small" />`

### `transactionTabMeta.ts` Changes

Add `case "decibelDetail": return "Decibel"` to `getTransactionTabHeadLabel`.

## Testing

- **Unit tests** for `parser.ts`: mock transactions with Decibel events/payloads, verify parsed output
- **Unit tests** for `isDecibelTransaction`: positive (Decibel txn) and negative (non-Decibel txn) cases
- **Unit test** for `getTabValues`: verify `decibelDetail` appears conditionally
- **Manual verification**: navigate to known Decibel transactions on testnet/mainnet and confirm the tab renders correctly with parsed data

## Verification Plan

1. Run `pnpm routes:generate` after adding the tab
2. Run `pnpm test --run` — all existing tests pass, new tests pass
3. Run `pnpm lint` and `pnpm fmt`
4. Manual: open a known Decibel transaction on testnet, verify tab appears with correct data
5. Manual: open a non-Decibel transaction, verify tab does NOT appear
6. Manual: resize browser to mobile width, verify card layout renders correctly
