import React from "react";
import Box from "@mui/material/Box";
import {useSearchParams} from "react-router-dom";
import {
  Pagination,
  Stack,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import {GetApp as DownloadIcon} from "@mui/icons-material";
import {UserTransactionsTable} from "../../Transactions/TransactionsTable";
import {
  useGetAccountAllTransactionCount,
  useGetAccountAllTransactionVersions,
} from "../../../api/hooks/useGetAccountAllTransactions";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";
import {transactionsToCSV, downloadCSV} from "../../utils";
import {Types} from "aptos";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {getTransaction} from "../../../api";
import {gql} from "@apollo/client";
import {useGetGraphqlClient} from "../../../api/hooks/useGraphqlClient";
import {tryStandardizeAddress} from "../../../utils";

function RenderPagination({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const logEvent = useLogEventWithBasic();

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    newPageNum: number,
  ) => {
    searchParams.set("page", newPageNum.toString());
    setSearchParams(searchParams);

    // logging
    logEvent("go_to_new_page", newPageNum, {
      current_page_num: currentPage.toString(),
      new_page_num: newPageNum.toString(),
    });
  };

  return (
    <Pagination
      sx={{mt: 3}}
      count={numPages}
      variant="outlined"
      showFirstButton
      showLastButton
      page={currentPage}
      siblingCount={4}
      boundaryCount={0}
      shape="rounded"
      onChange={handleChange}
    />
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
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const offset = (currentPage - 1) * countPerPage;

  const versions = useGetAccountAllTransactionVersions(
    address,
    countPerPage,
    offset,
  );

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{width: "auto", overflowX: "auto"}}>
          <UserTransactionsTable versions={versions} address={address} />
        </Box>
        {numPages > 1 && (
          <Box sx={{display: "flex", justifyContent: "center"}}>
            <RenderPagination currentPage={currentPage} numPages={numPages} />
          </Box>
        )}
      </Stack>
    </>
  );
}

type AccountAllTransactionsProps = {
  address: string;
};

export default function AccountAllTransactions({
  address,
}: AccountAllTransactionsProps) {
  let txnCount = useGetAccountAllTransactionCount(address);
  let canSeeAll = true;

  if (txnCount === undefined) {
    // If we can't load the number of transactions, the indexer query is too expensive
    // We'll default to 10k transactions in the event there's no account data,
    // it's better to allow access then to fail
    // Sequence number, is not a reliable way to determine the number of transactions, and will lead to
    // empty pages in really large accounts.
    txnCount = 10000;
    canSeeAll = false;
  }

  const countPerPage = 25;
  const numPages = Math.ceil(txnCount / countPerPage);

  return (
    <Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{my: 2}}
      >
        <Typography>
          {canSeeAll
            ? `Showing all ${txnCount} transactions`
            : `Showing the last ${txnCount} transactions`}
        </Typography>
        {txnCount > 0 && (
          <CSVExportButton address={address} totalTransactionCount={txnCount} />
        )}
      </Stack>
      <AccountAllTransactionsWithPagination
        address={address}
        numPages={numPages}
        countPerPage={countPerPage}
      />
    </Stack>
  );
}

// GraphQL query for fetching transaction versions
const ACCOUNT_TRANSACTIONS_QUERY = gql`
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

// CSV Export Button Component
function CSVExportButton({
  address,
  totalTransactionCount,
}: {
  address: string;
  totalTransactionCount: number;
}) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const [state] = useGlobalState();
  const logEvent = useLogEventWithBasic();
  const graphqlClient = useGetGraphqlClient();

  // Helper function to check if error is a rate limit error
  const isRateLimitError = (error: unknown): boolean => {
    if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;
      // Check for HTTP 429 status
      if (
        errorObj.statusCode === 429 ||
        (errorObj.networkError &&
          typeof errorObj.networkError === "object" &&
          (errorObj.networkError as Record<string, unknown>).statusCode === 429)
      ) {
        return true;
      }
      // Check for rate limit in error message
      const message =
        typeof errorObj.message === "string"
          ? errorObj.message.toLowerCase()
          : "";
      if (message.includes("rate limit")) {
        return true;
      }
      // Check nested network error messages
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

  // Helper function to sleep/delay
  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Retry function with exponential backoff
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  const retryWithBackoff = async <T extends unknown>(
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
          // Exponential backoff: 1s, 2s, 4s for rate limits
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
          );
          await sleep(delay);
        } else if (!isRateLimit && attempt < maxRetries - 1) {
          // Shorter delay for other errors
          const delay = baseDelay * (attempt + 1);
          console.warn(
            `Error occurred, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
            error,
          );
          await sleep(delay);
        } else {
          // Last attempt failed or non-retryable error
          throw error;
        }
      }
    }
    throw lastError;
  };

  // Function to fetch all transaction versions with pagination and retry logic
  const fetchAllTransactionVersions = async (
    maxCount: number,
  ): Promise<number[]> => {
    const addr64Hash = tryStandardizeAddress(address);
    if (!addr64Hash) {
      return [];
    }

    const allVersions: number[] = [];
    const pageSize = 100; // GraphQL API limit per page
    let offset = 0;
    let hasMore = true;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    while (hasMore && allVersions.length < maxCount) {
      try {
        const result = await retryWithBackoff(async () => {
          return await graphqlClient.query<{
            account_transactions: {transaction_version: number}[];
          }>({
            query: ACCOUNT_TRANSACTIONS_QUERY,
            variables: {
              address: addr64Hash,
              limit: pageSize,
              offset: offset,
            },
            fetchPolicy: "network-only", // Always fetch fresh data
          });
        });

        if (!result.data) {
          throw new Error("No data returned from GraphQL query");
        }

        const versions = result.data.account_transactions.map(
          (txn) => txn.transaction_version,
        );

        consecutiveErrors = 0; // Reset error counter on success

        if (versions.length === 0) {
          hasMore = false;
        } else {
          allVersions.push(...versions);
          offset += pageSize;

          // Update progress for fetching versions
          const fetchProgress = Math.min(
            Math.round((allVersions.length / maxCount) * 50), // First 50% is for fetching versions
            50,
          );
          setExportProgress(fetchProgress);

          // If we got fewer than pageSize, we've reached the end
          if (versions.length < pageSize) {
            hasMore = false;
          }
        }

        // Add delay between GraphQL queries to avoid rate limiting
        // Only delay if we're not at the last page
        if (hasMore && allVersions.length < maxCount) {
          await sleep(200); // 200ms delay between GraphQL queries
        }
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `Error fetching transaction versions (offset: ${offset}, consecutive errors: ${consecutiveErrors}):`,
          error,
        );

        // If we've had too many consecutive errors, stop trying
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(
            `Stopping after ${maxConsecutiveErrors} consecutive errors fetching transaction versions`,
          );
          hasMore = false;
        } else {
          // Wait before retrying
          const delay = 1000 * consecutiveErrors; // Increasing delay: 1s, 2s, 3s
          await sleep(delay);
        }
      }
    }

    // Limit to maxCount
    return allVersions.slice(0, maxCount);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    const maxTransactions = Math.min(totalTransactionCount, 10000);
    logEvent("export_transactions_csv", maxTransactions, {
      address: address,
      total_transactions: maxTransactions.toString(),
    });

    try {
      // Step 1: Fetch all transaction versions with pagination
      setExportProgress(0);
      const versions = await fetchAllTransactionVersions(maxTransactions);

      if (versions.length === 0) {
        alert("No transactions found to export.");
        setIsExporting(false);
        return;
      }

      // Step 2: Fetch transaction data using the existing API with retry logic
      const transactions: Types.Transaction[] = [];
      const failedVersions: number[] = [];
      const batchSize = 10; // Process transactions in batches

      for (let i = 0; i < versions.length; i += batchSize) {
        const batch = versions.slice(i, i + batchSize);

        const batchPromises = batch.map(async (version) => {
          try {
            return await retryWithBackoff(
              async () => {
                return await getTransaction(
                  {txnHashOrVersion: version},
                  state.aptos_client,
                );
              },
              3, // max retries
              500, // base delay (shorter for transaction fetches)
            );
          } catch (error) {
            console.error(
              `Failed to fetch transaction ${version} after retries:`,
              error,
            );
            failedVersions.push(version);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validTransactions = batchResults.filter(
          (txn): txn is Types.Transaction => txn !== null,
        );
        transactions.push(...validTransactions);

        // Update progress (50-100% is for fetching transaction details)
        const processedSoFar = i + batchSize;
        const fetchProgress =
          50 + Math.round((processedSoFar / versions.length) * 50);
        setExportProgress(Math.min(fetchProgress, 100));

        // Delay between batches to avoid overwhelming the API
        // Longer delay if we had failures in this batch
        if (i + batchSize < versions.length) {
          const delay = validTransactions.length < batch.length ? 300 : 100;
          await sleep(delay);
        }
      }

      // Log warning if some transactions failed
      if (failedVersions.length > 0) {
        console.warn(
          `Failed to fetch ${failedVersions.length} out of ${versions.length} transactions`,
        );
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

      // Convert to CSV
      const csvContent = transactionsToCSV(transactions, address);

      // Download the CSV
      const filename = `account_transactions_${address.slice(-8)}_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(csvContent, filename);

      // Show success message with warning if some transactions failed
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
        : `Export CSV (${Math.min(totalTransactionCount, 10000)})`}
    </Button>
  );
}
