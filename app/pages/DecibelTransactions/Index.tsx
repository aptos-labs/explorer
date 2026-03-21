import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import type {Types} from "~/types/aptos";
import {getLedgerInfo, getTransactions} from "../../api";
import {type ResponseError, ResponseErrorType} from "../../api/client";
import {AptosClient} from "../../api/legacyClient";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {getApiKey, networks} from "../../constants";
import {useSearchParams} from "../../routing";
import PageHeader from "../layout/PageHeader";
import DecibelNetworkStatus from "./DecibelNetworkStatus";
import DecibelTransactionCard from "./DecibelTransactionCard";

const LIMIT = 20;
const DECIBEL_NETWORK = "decibel" as const;

function useDecibelClient(): AptosClient {
  return useMemo(() => {
    const nodeUrl = networks[DECIBEL_NETWORK];
    const apiKey = getApiKey(DECIBEL_NETWORK);
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    return new AptosClient(nodeUrl, {HEADERS: headers});
  }, []);
}

function maxStart(maxVersion: number, limit: number) {
  return 1 + maxVersion - limit;
}

export default function DecibelTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const decibelClient = useDecibelClient();
  const networkValue = networks[DECIBEL_NETWORK];

  const {
    data: ledgerInfo,
    isLoading: isLedgerLoading,
    error: ledgerError,
    refetch: refetchLedger,
  } = useQuery<Types.IndexResponse, ResponseError>({
    queryKey: ["decibelLedgerInfo", networkValue],
    queryFn: () => getLedgerInfo(decibelClient),
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const maxVersion = ledgerInfo?.ledger_version
    ? parseInt(ledgerInfo.ledger_version, 10)
    : 0;
  const limit = LIMIT;
  let start = maxStart(maxVersion, limit);
  const startParam = searchParams.get("start");
  if (startParam !== null) {
    start = parseInt(startParam, 10);
  }

  const currentPage =
    maxVersion > 0
      ? Math.max(
          1,
          1 + Math.floor((1 - (start + limit - 1) / maxVersion) * numPages()),
        )
      : 1;

  function numPages() {
    return Math.max(1, Math.ceil(maxVersion / limit));
  }

  const {
    data: transactions,
    isLoading: isTxnLoading,
    error: txnError,
    refetch: refetchTxns,
  } = useQuery<Types.Transaction[], ResponseError>({
    queryKey: ["decibelTransactions", {start, limit}, networkValue],
    queryFn: () => getTransactions({start, limit}, decibelClient),
    placeholderData: keepPreviousData,
    enabled: !!ledgerInfo?.ledger_version,
  });

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    const delta = (currentPage - newPageNum) * limit;
    const newStart = Math.max(
      0,
      Math.min(maxStart(maxVersion, limit), start + delta),
    );
    searchParams.set("start", newStart.toString());
    setSearchParams(searchParams);
  };

  const handleRefresh = () => {
    refetchLedger();
    refetchTxns();
  };

  const errorToResponseError = (err: unknown): ResponseError | null => {
    if (!err) return null;
    if (
      typeof err === "object" &&
      err !== null &&
      "type" in err &&
      typeof (err as {type: unknown}).type === "string"
    ) {
      return err as ResponseError;
    }
    return {
      type: ResponseErrorType.UNHANDLED,
      message:
        typeof err === "object" && err !== null && "message" in err
          ? String((err as {message: unknown}).message)
          : String(err),
    };
  };

  return (
    <Box>
      <PageMetadata
        title="Decibel Network Transactions"
        description="Browse detailed transactions on the Aptos Decibel network. View transaction events, payload, balance changes, state changes, and gas details with enhanced visualization."
        type="website"
        keywords={[
          "decibel",
          "transactions",
          "aptos",
          "network",
          "blockchain",
          "detailed",
        ]}
        canonicalPath="/transactions/decibel"
      />
      <PageHeader />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <Typography variant="h3" component="h1">
          Decibel Transactions
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <DecibelNetworkStatus
        ledgerInfo={ledgerInfo}
        isLoading={isLedgerLoading}
      />

      {ledgerError && (
        <Alert severity="error" sx={{mb: 2}}>
          Failed to connect to Decibel network:{" "}
          {errorToResponseError(ledgerError)?.message ?? "Unknown error"}
        </Alert>
      )}

      {isTxnLoading && !transactions && (
        <Box sx={{display: "flex", justifyContent: "center", py: 6}}>
          <CircularProgress />
        </Box>
      )}

      {txnError && !transactions && (
        <Alert severity="error" sx={{mb: 2}}>
          Failed to load transactions:{" "}
          {errorToResponseError(txnError)?.message ?? "Unknown error"}
        </Alert>
      )}

      {transactions && transactions.length > 0 && (
        <Stack spacing={1.5}>
          {transactions.map((txn) => (
            <DecibelTransactionCard key={txn.hash} transaction={txn} />
          ))}
        </Stack>
      )}

      {transactions && transactions.length === 0 && (
        <Alert severity="info" sx={{mt: 2}}>
          No transactions found on the Decibel network.
        </Alert>
      )}

      {maxVersion > 0 && (
        <Box sx={{display: "flex", justifyContent: "center", mt: 3}}>
          <Pagination
            count={numPages()}
            variant="outlined"
            showFirstButton
            showLastButton
            page={currentPage}
            siblingCount={4}
            boundaryCount={0}
            shape="rounded"
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
}
