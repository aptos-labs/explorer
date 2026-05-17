import {GetApp as DownloadIcon, InfoOutlined} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import type {Types} from "~/types/aptos";
import {getTransaction} from "../../../api";
import useFunctionFilter, {
  type FunctionFilterParams,
} from "../../../api/hooks/useFunctionFilter";
import {
  useGetAccountAllTransactionCount,
  useGetAccountAllTransactionVersions,
  useGetAccountTransactionsByFunctionCount,
  useGetAccountTransactionVersionsByFunction,
} from "../../../api/hooks/useGetAccountAllTransactions";
import PageNumberPagination, {
  useCurrentPage,
} from "../../../components/PageNumberPagination";
import {
  useAptosClient,
  useSdkV2Client,
} from "../../../global-config/GlobalConfig";
import {tryStandardizeAddress} from "../../../utils";
import FunctionFilter from "../../Transactions/Components/FunctionFilter";
import {UserTransactionsTable} from "../../Transactions/TransactionsTable";
import {downloadCSV, transactionsToCSV} from "../../utils";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";

const MAX_DISPLAYABLE_TRANSACTIONS = 10000;

function useTransactionsPaginationCallback() {
  const logEvent = useLogEventWithBasic();
  return React.useCallback(
    (newPageNum: number, currentPage: number) => {
      logEvent("go_to_new_page", newPageNum, {
        current_page_num: currentPage.toString(),
        new_page_num: newPageNum.toString(),
      });
    },
    [logEvent],
  );
}

type AccountAllTransactionsWithPaginationProps = {
  address: string;
  numPages: number;
  countPerPage: number;
};

export function AccountAllTransactionsWithPagination({
  address,
  numPages,
  countPerPage,
}: AccountAllTransactionsWithPaginationProps) {
  const currentPage = useCurrentPage();
  const offset = (currentPage - 1) * countPerPage;
  const onPageChange = useTransactionsPaginationCallback();

  const versions = useGetAccountAllTransactionVersions(
    address,
    countPerPage,
    offset,
  );

  return (
    <Stack spacing={2}>
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <UserTransactionsTable versions={versions} address={address} />
      </Box>
      {numPages > 1 && (
        <PageNumberPagination
          currentPage={currentPage}
          numPages={numPages}
          onPageChange={onPageChange}
        />
      )}
    </Stack>
  );
}

type FilteredAccountTransactionsProps = {
  address: string;
  functionFilter: FunctionFilterParams;
  countPerPage: number;
};

function FilteredAccountTransactions({
  address,
  functionFilter,
  countPerPage,
}: FilteredAccountTransactionsProps) {
  const currentPage = useCurrentPage();
  const offset = (currentPage - 1) * countPerPage;
  const onPageChange = useTransactionsPaginationCallback();

  const txnCount = useGetAccountTransactionsByFunctionCount(
    address,
    functionFilter,
  );
  const {versions, isLoading, isError} =
    useGetAccountTransactionVersionsByFunction(
      address,
      functionFilter,
      countPerPage,
      offset,
    );

  const numPages =
    txnCount !== undefined ? Math.ceil(txnCount / countPerPage) : 1;

  if (isLoading) {
    return (
      <Box sx={{display: "flex", justifyContent: "center", py: 4}}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Failed to filter transactions by function. The filter values may be
        invalid or the indexer may be temporarily unavailable.
      </Alert>
    );
  }

  if (versions.length === 0) {
    return (
      <Box sx={{py: 4, textAlign: "center"}}>
        <Typography
          sx={{
            color: "text.secondary",
          }}
        >
          No transactions found matching the filter criteria sent by this
          account
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {txnCount !== undefined && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {txnCount.toLocaleString()} matching transaction
          {txnCount !== 1 ? "s" : ""} (sent by this account)
        </Typography>
      )}
      <Box sx={{width: "auto", overflowX: "auto"}}>
        <UserTransactionsTable versions={versions} address={address} />
      </Box>
      {numPages > 1 && (
        <PageNumberPagination
          currentPage={currentPage}
          numPages={numPages}
          onPageChange={onPageChange}
        />
      )}
    </Stack>
  );
}

type AccountAllTransactionsProps = {
  address: string;
};

export default function AccountAllTransactions({
  address,
}: AccountAllTransactionsProps) {
  const {
    functionFilter,
    handleFunctionFilterChange,
    clearFunctionFilter,
    isFilterActive,
  } = useFunctionFilter();

  const rawTxnCount = useGetAccountAllTransactionCount(address);

  const isCountUnknown = rawTxnCount === undefined;
  const txnCount = isCountUnknown ? MAX_DISPLAYABLE_TRANSACTIONS : rawTxnCount;

  const countPerPage = 25;
  const numPages = Math.ceil(txnCount / countPerPage);

  return (
    <Stack spacing={2}>
      <FunctionFilter
        value={functionFilter}
        onChange={handleFunctionFilterChange}
        onClear={clearFunctionFilter}
        isFilterActive={isFilterActive}
      />
      {!isFilterActive && isCountUnknown && (
        <Alert
          severity="info"
          icon={<InfoOutlined />}
          sx={{
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <AlertTitle>Transaction History Limited</AlertTitle>
          This account has a large transaction history. Due to performance
          constraints, only the latest{" "}
          <strong>{MAX_DISPLAYABLE_TRANSACTIONS.toLocaleString()}</strong>{" "}
          transactions are displayed. Older transactions are not shown but can
          still be accessed directly by their version number.
        </Alert>
      )}
      {isFilterActive ? (
        <>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
            }}
          >
            Function filter searches transactions sent by this account only, not
            all transactions involving it.
          </Typography>
          <FilteredAccountTransactions
            address={address}
            functionFilter={functionFilter}
            countPerPage={countPerPage}
          />
        </>
      ) : (
        <>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              my: isCountUnknown ? 0 : 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: "medium",
              }}
            >
              {isCountUnknown
                ? `Showing up to ${txnCount.toLocaleString()} transactions`
                : `${txnCount.toLocaleString()} transactions`}
            </Typography>
            {txnCount > 0 && (
              <CSVExportButton
                address={address}
                totalTransactionCount={txnCount}
              />
            )}
          </Stack>
          <AccountAllTransactionsWithPagination
            address={address}
            numPages={numPages}
            countPerPage={countPerPage}
          />
        </>
      )}
    </Stack>
  );
}

const ACCOUNT_TRANSACTIONS_QUERY = `
  query AccountTransactionsData($address: String, $limit: Int, $offset: Int) {
    account_transactions(
      where: {account_address: {_eq: $address}}
      order_by: {transaction_version: desc}
      limit: $limit
      offset: $offset
    ) {
      transaction_version
    }
  }
`;

function CSVExportButton({
  address,
  totalTransactionCount,
}: {
  address: string;
  totalTransactionCount: number;
}) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const aptosClient = useAptosClient();
  const logEvent = useLogEventWithBasic();
  const sdkV2Client = useSdkV2Client();

  const isRateLimitError = (error: unknown): boolean => {
    if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;
      if (
        errorObj.statusCode === 429 ||
        (errorObj.networkError &&
          typeof errorObj.networkError === "object" &&
          (errorObj.networkError as Record<string, unknown>).statusCode === 429)
      ) {
        return true;
      }
      const message =
        typeof errorObj.message === "string"
          ? errorObj.message.toLowerCase()
          : "";
      if (message.includes("rate limit")) {
        return true;
      }
      if (errorObj.networkError && typeof errorObj.networkError === "object") {
        const networkError = errorObj.networkError as Record<string, unknown>;
        if (networkError.result && typeof networkError.result === "object") {
          const result = networkError.result as Record<string, unknown>;
          if (Array.isArray(result.errors)) {
            const hasRateLimitError = result.errors.some(
              (e: unknown) =>
                e &&
                typeof e === "object" &&
                typeof (e as Record<string, unknown>).message === "string" &&
                ((e as Record<string, unknown>).message as string)
                  .toLowerCase()
                  .includes("rate limit"),
            );
            if (hasRateLimitError) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> => {
    let lastError: unknown;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const isRateLimit = isRateLimitError(error);

        if (isRateLimit && attempt < maxRetries - 1) {
          const delay = baseDelay * 2 ** attempt;
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
            );
          }
          await sleep(delay);
        } else if (!isRateLimit && attempt < maxRetries - 1) {
          const delay = baseDelay * (attempt + 1);
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `Error occurred, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
              error,
            );
          }
          await sleep(delay);
        } else {
          throw error;
        }
      }
    }
    throw lastError;
  };

  const fetchAllTransactionVersions = async (
    maxCount: number,
  ): Promise<number[]> => {
    const addr64Hash = tryStandardizeAddress(address);
    if (!addr64Hash) {
      return [];
    }

    const allVersions: number[] = [];
    const pageSize = 100;
    let offset = 0;
    let hasMore = true;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    while (hasMore && allVersions.length < maxCount) {
      try {
        const result = await retryWithBackoff(async () => {
          return await sdkV2Client.queryIndexer<{
            account_transactions: {transaction_version: number}[];
          }>({
            query: {
              query: ACCOUNT_TRANSACTIONS_QUERY,
              variables: {
                address: addr64Hash,
                limit: pageSize,
                offset: offset,
              },
            },
          });
        });

        if (!result) {
          throw new Error("No data returned from GraphQL query");
        }

        const versions = result.account_transactions.map(
          (txn) => txn.transaction_version,
        );

        consecutiveErrors = 0;

        if (versions.length === 0) {
          hasMore = false;
        } else {
          allVersions.push(...versions);
          offset += pageSize;

          const fetchProgress = Math.min(
            Math.round((allVersions.length / maxCount) * 50),
            50,
          );
          setExportProgress(fetchProgress);

          if (versions.length < pageSize) {
            hasMore = false;
          }
        }

        if (hasMore && allVersions.length < maxCount) {
          await sleep(200);
        }
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `Error fetching transaction versions (offset: ${offset}, consecutive errors: ${consecutiveErrors}):`,
          error,
        );

        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(
            `Stopping after ${maxConsecutiveErrors} consecutive errors fetching transaction versions`,
          );
          hasMore = false;
        } else {
          const delay = 1000 * consecutiveErrors;
          await sleep(delay);
        }
      }
    }

    return allVersions.slice(0, maxCount);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    const maxTransactions = Math.min(
      totalTransactionCount,
      MAX_DISPLAYABLE_TRANSACTIONS,
    );
    logEvent("export_transactions_csv", maxTransactions, {
      address: address,
      total_transactions: maxTransactions.toString(),
    });

    try {
      setExportProgress(0);
      const versions = await fetchAllTransactionVersions(maxTransactions);

      if (versions.length === 0) {
        alert("No transactions found to export.");
        setIsExporting(false);
        return;
      }

      const transactions: Types.Transaction[] = [];
      const failedVersions: number[] = [];

      // Batch by ledger-version range using `/v1/transactions?start=X&limit=Y`
      // (which returns every transaction type in that range — user, state
      // checkpoint, block metadata). Per-version REST falls back for any
      // gaps the batch didn't fill (e.g. ranges so sparse that fetching
      // the full span is wasteful) so an export of 10k transactions issues
      // ~100 REST calls instead of ~10 000.
      const sortedVersions = [...versions].sort((a, b) => a - b);
      const fetchedByVersion = new Map<number, Types.Transaction>();
      const RANGE_BATCH_LIMIT = 100;
      let cursor = 0;
      while (cursor < sortedVersions.length) {
        const rangeStart = sortedVersions[cursor];
        // Pick the largest contiguous slice of `sortedVersions` whose total
        // span fits within `RANGE_BATCH_LIMIT`.
        let end = cursor;
        while (
          end + 1 < sortedVersions.length &&
          sortedVersions[end + 1] - rangeStart + 1 <= RANGE_BATCH_LIMIT
        ) {
          end++;
        }
        const rangeEnd = sortedVersions[end];
        const span = rangeEnd - rangeStart + 1;

        try {
          const txnsInRange = await retryWithBackoff(
            async () =>
              await aptosClient.getTransactions({
                start: BigInt(rangeStart),
                limit: span,
              }),
            3,
            500,
          );
          for (const txn of txnsInRange) {
            if (!("version" in txn) || txn.version == null) continue;
            const v = Number(txn.version);
            if (Number.isFinite(v)) fetchedByVersion.set(v, txn);
          }
        } catch (error) {
          console.error(
            `Failed to fetch transaction range ${rangeStart}..${rangeEnd} after retries:`,
            error,
          );
        }

        cursor = end + 1;
        const fetchProgress = 50 + Math.round((cursor / sortedVersions.length) * 50);
        setExportProgress(Math.min(fetchProgress, 100));

        if (cursor < sortedVersions.length) {
          await sleep(100);
        }
      }

      // Per-version fallback for anything the batched fetch missed (sparse
      // ranges, or rows skipped because the range exceeded the cap).
      const missingVersions = sortedVersions.filter(
        (v) => !fetchedByVersion.has(v),
      );
      if (missingVersions.length > 0) {
        const FALLBACK_BATCH = 10;
        for (let i = 0; i < missingVersions.length; i += FALLBACK_BATCH) {
          const batch = missingVersions.slice(i, i + FALLBACK_BATCH);
          const results = await Promise.all(
            batch.map(async (version) => {
              try {
                return await retryWithBackoff(
                  async () =>
                    await getTransaction(
                      {txnHashOrVersion: version},
                      aptosClient,
                    ),
                  3,
                  500,
                );
              } catch (error) {
                console.error(
                  `Failed to fetch transaction ${version} after retries:`,
                  error,
                );
                failedVersions.push(version);
                return null;
              }
            }),
          );
          for (let j = 0; j < results.length; j++) {
            const txn = results[j];
            if (txn) fetchedByVersion.set(batch[j], txn);
          }
          if (i + FALLBACK_BATCH < missingVersions.length) {
            await sleep(200);
          }
        }
      }

      // Restore caller-requested order.
      for (const v of versions) {
        const txn = fetchedByVersion.get(v);
        if (txn) transactions.push(txn);
      }

      if (failedVersions.length > 0) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Failed to fetch ${failedVersions.length} out of ${versions.length} transactions`,
          );
        }
        logEvent("export_transactions_csv_partial", transactions.length, {
          address: address,
          exported_transactions: transactions.length.toString(),
          failed_transactions: failedVersions.length.toString(),
          total_available: maxTransactions.toString(),
        });
      }

      if (transactions.length === 0) {
        alert(
          "No transactions found to export. All transaction fetches may have failed.",
        );
        setIsExporting(false);
        return;
      }

      const csvContent = transactionsToCSV(transactions, address);

      const filename = `account_transactions_${address.slice(-8)}_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(csvContent, filename);

      if (failedVersions.length > 0) {
        alert(
          `Exported ${transactions.length} transactions successfully. ` +
            `${failedVersions.length} transactions could not be fetched and were excluded from the export.`,
        );
      }

      logEvent("export_transactions_csv_success", transactions.length, {
        address: address,
        exported_transactions: transactions.length.toString(),
        failed_transactions: failedVersions.length.toString(),
        total_available: maxTransactions.toString(),
      });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      const errorMessage = isRateLimitError(error)
        ? "Rate limit exceeded. Please wait a moment and try again."
        : error instanceof Error
          ? `Error exporting transactions: ${error.message}`
          : "Error exporting transactions. Please try again.";
      alert(errorMessage);
      logEvent("export_transactions_csv_error", 0, {
        address: address,
        error: error instanceof Error ? error.message : "Unknown error",
        is_rate_limit: isRateLimitError(error).toString(),
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={
        isExporting ? <CircularProgress size={16} /> : <DownloadIcon />
      }
      onClick={handleExport}
      disabled={isExporting}
      size="small"
    >
      {isExporting
        ? totalTransactionCount > 100
          ? `Exporting... ${exportProgress}%`
          : "Exporting..."
        : `Export CSV (${Math.min(totalTransactionCount, MAX_DISPLAYABLE_TRANSACTIONS).toLocaleString()})`}
    </Button>
  );
}
