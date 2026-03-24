import {GetApp as DownloadIcon} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {useCallback, useReducer, useState} from "react";
import {
  type CoinHolder,
  useGetCoinHolders,
} from "../../../api/hooks/useGetCoinHolders";
import HashButton, {HashType} from "../../../components/HashButton";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import {useSdkV2Client} from "../../../global-config";
import {downloadCSV} from "../../../utils";
import type {CoinData} from "../Components/CoinData";

type HoldersTabProps = {
  struct: string;
  data: CoinData | undefined;
};

const TOP_HOLDER_LIMIT = 100;
const FETCH_PAGE_SIZE = 100;

export default function HoldersTab({struct, data}: HoldersTabProps) {
  return <HoldersContent key={struct} struct={struct} data={data} />;
}

type HoldersState = {
  offset: number;
  holders: CoinHolder[];
  lastLoadedOffset: number;
};

type HoldersAction =
  | {type: "LOAD_MORE"}
  | {type: "DATA_LOADED"; payload: {offset: number; data: CoinHolder[]}};

function holdersReducer(
  state: HoldersState,
  action: HoldersAction,
): HoldersState {
  switch (action.type) {
    case "LOAD_MORE":
      return {...state, offset: state.offset + FETCH_PAGE_SIZE};
    case "DATA_LOADED":
      if (action.payload.offset === state.lastLoadedOffset) {
        return state;
      }
      if (action.payload.offset === 0) {
        return {
          ...state,
          holders: action.payload.data,
          lastLoadedOffset: 0,
        };
      }
      return {
        ...state,
        holders: [...state.holders, ...action.payload.data],
        lastLoadedOffset: action.payload.offset,
      };
    default:
      return state;
  }
}

function HoldersContent({struct, data}: HoldersTabProps) {
  const [state, dispatch] = useReducer(holdersReducer, {
    offset: 0,
    holders: [],
    lastLoadedOffset: -1,
  });

  const holderData = useGetCoinHolders(struct, TOP_HOLDER_LIMIT, state.offset);

  if (
    holderData.data &&
    holderData.data.length > 0 &&
    state.lastLoadedOffset !== state.offset
  ) {
    dispatch({
      type: "DATA_LOADED",
      payload: {offset: state.offset, data: holderData.data},
    });
  }

  if (holderData.isLoading && state.holders.length === 0) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", padding: 4}}>
        <CircularProgress />
      </Box>
    );
  }
  if (!data || Array.isArray(data) || state.holders.length === 0) {
    return <EmptyTabContent />;
  }

  const top100 = state.holders.slice(0, TOP_HOLDER_LIMIT);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{px: 2, py: 1.5}}
      >
        <Typography variant="body2" color="text.secondary">
          Top {top100.length} holders by balance
        </Typography>
        <HoldersCSVExportButton
          coinType={struct}
          decimals={data.data.decimals}
          symbol={data.data.symbol}
        />
      </Stack>
      <HoldersTable data={data} holders={top100} offset={0} />
    </Box>
  );
}

export function HoldersTable({
  data,
  holders,
  offset = 0,
}: {
  holders: CoinHolder[];
  data: CoinData;
  offset?: number;
}) {
  return (
    <Table aria-label="Coin holders" data-entity-type="holder">
      <TableHead>
        <TableRow>
          <GeneralTableHeaderCell header="rank" />
          <GeneralTableHeaderCell header="address" />
          <GeneralTableHeaderCell header="amount" textAlignRight={true} />
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {holders.map((holder, i) => {
          return (
            <GeneralTableRow key={holder.owner_address}>
              <GeneralTableCell>{offset + i + 1}</GeneralTableCell>
              <GeneralTableCell>
                <HashButton
                  hash={holder.owner_address}
                  type={HashType.ACCOUNT}
                />
              </GeneralTableCell>
              <GeneralTableCell align={"right"}>
                {getFormattedBalanceStr(
                  holder.amount.toString(),
                  data.data.decimals,
                ) +
                  " " +
                  data.data.symbol}
              </GeneralTableCell>
            </GeneralTableRow>
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}

type CSVExportState =
  | {status: "idle"}
  | {status: "fetching"; fetched: number; error?: undefined}
  | {status: "done"; fetched: number}
  | {status: "error"; message: string};

function HoldersCSVExportButton({
  coinType,
  decimals,
  symbol,
}: {
  coinType: string;
  decimals: number;
  symbol: string;
}) {
  const client = useSdkV2Client();
  const [exportState, setExportState] = useState<CSVExportState>({
    status: "idle",
  });

  const isRateLimitError = useCallback((error: unknown): boolean => {
    if (error && typeof error === "object") {
      const e = error as Record<string, unknown>;
      if (e.statusCode === 429) return true;
      const msg = typeof e.message === "string" ? e.message.toLowerCase() : "";
      if (msg.includes("rate limit")) return true;
    }
    return false;
  }, []);

  const sleep = useCallback(
    (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
    [],
  );

  const handleExport = useCallback(async () => {
    setExportState({status: "fetching", fetched: 0});
    const allHolders: CoinHolder[] = [];
    const pageSize = FETCH_PAGE_SIZE;
    let offset = 0;
    let hasMore = true;
    let consecutiveErrors = 0;

    while (hasMore) {
      try {
        const result = await client.queryIndexer<{
          current_fungible_asset_balances: CoinHolder[];
        }>({
          query: {
            query: `
              query GetFungibleAssetBalances($coin_type: String!, $limit: Int!, $offset: Int!) {
                current_fungible_asset_balances(
                  where: {asset_type: {_eq: $coin_type}}
                  limit: $limit
                  offset: $offset
                  order_by: {amount: desc}
                ) {
                  owner_address
                  amount
                }
              }
            `,
            variables: {coin_type: coinType, limit: pageSize, offset},
          },
        });

        const page = result?.current_fungible_asset_balances ?? [];
        consecutiveErrors = 0;
        allHolders.push(...page);
        setExportState({status: "fetching", fetched: allHolders.length});

        if (page.length < pageSize) {
          hasMore = false;
        } else {
          offset += pageSize;
          await sleep(250);
        }
      } catch (error) {
        consecutiveErrors++;
        if (isRateLimitError(error)) {
          const delay = 2000 * 2 ** (consecutiveErrors - 1);
          setExportState({status: "fetching", fetched: allHolders.length});
          await sleep(delay);
        } else if (consecutiveErrors >= 3) {
          setExportState({
            status: "error",
            message: `Export stopped after errors. ${allHolders.length} holders collected so far.`,
          });
          if (allHolders.length > 0) {
            buildAndDownload(allHolders, coinType, decimals, symbol);
          }
          return;
        } else {
          await sleep(1000 * consecutiveErrors);
        }
      }
    }

    if (allHolders.length === 0) {
      setExportState({status: "error", message: "No holders found."});
      return;
    }

    buildAndDownload(allHolders, coinType, decimals, symbol);
    setExportState({status: "done", fetched: allHolders.length});
    setTimeout(() => setExportState({status: "idle"}), 5000);
  }, [client, coinType, decimals, symbol, isRateLimitError, sleep]);

  return (
    <Stack spacing={1} alignItems="flex-end">
      <Button
        variant="outlined"
        size="small"
        startIcon={
          exportState.status === "fetching" ? (
            <CircularProgress size={16} />
          ) : (
            <DownloadIcon />
          )
        }
        onClick={handleExport}
        disabled={exportState.status === "fetching"}
      >
        {exportState.status === "fetching"
          ? `Collecting holders… ${exportState.fetched.toLocaleString()}`
          : "Export All Holders CSV"}
      </Button>
      {exportState.status === "fetching" && (
        <Box sx={{width: 220}}>
          <LinearProgress variant="indeterminate" />
          <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>
            Paginating through all holders — this may take a while for popular
            assets due to API rate limits.
          </Typography>
        </Box>
      )}
      {exportState.status === "done" && (
        <Typography variant="caption" color="success.main">
          Exported {exportState.fetched.toLocaleString()} holders
        </Typography>
      )}
      {exportState.status === "error" && (
        <Alert severity="warning" sx={{maxWidth: 340}}>
          {exportState.message}
        </Alert>
      )}
    </Stack>
  );
}

function buildAndDownload(
  holders: CoinHolder[],
  coinType: string,
  decimals: number,
  symbol: string,
) {
  const headers = ["rank", "owner_address", "raw_amount", "formatted_amount"];
  let csv = `${headers.join(",")}\n`;
  holders.forEach((h, i) => {
    const formatted = getFormattedBalanceStr(h.amount.toString(), decimals);
    csv += `${i + 1},${h.owner_address},${h.amount},"${formatted} ${symbol}"\n`;
  });
  const safeName = coinType.replace(/[^a-zA-Z0-9_:]/g, "_").slice(0, 60);
  downloadCSV(
    csv,
    `holders_${safeName}_${new Date().toISOString().split("T")[0]}.csv`,
  );
}
