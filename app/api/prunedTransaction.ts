/**
 * Detects fullnode responses for data that is missing or has been ledger-pruned.
 * Used to decide when to reconstruct a transaction from the indexer.
 */

const PRUNED_ERROR_CODES = new Set([
  "version_pruned",
  "transaction_pruned",
  "transaction_not_found",
]);

function readErrorCode(error: object): string | undefined {
  if (
    "data" in error &&
    typeof (error as {data?: unknown}).data === "object" &&
    (error as {data?: {error_code?: unknown}}).data !== null
  ) {
    const code = (error as {data: {error_code?: unknown}}).data.error_code;
    if (typeof code === "string") return code;
  }
  if (
    "error_code" in error &&
    typeof (error as {error_code?: unknown}).error_code === "string"
  ) {
    return (error as {error_code: string}).error_code;
  }
  return undefined;
}

function readStatus(error: object): number | undefined {
  if (
    "status" in error &&
    typeof (error as {status?: unknown}).status === "number"
  ) {
    return (error as {status: number}).status;
  }
  return undefined;
}

function readMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as {message?: unknown}).message === "string"
  ) {
    return (error as {message: string}).message;
  }
  return "";
}

/**
 * True when a REST / SDK error means the transaction is unknown to this node
 * or has been pruned from its ledger window (HTTP 404 / 410, or equivalent).
 */
export function isPrunedOrNotFoundError(error: unknown): boolean {
  if (error == null) return false;

  if (typeof error === "object") {
    const status = readStatus(error);
    if (status === 404 || status === 410) return true;

    if ("type" in error && (error as {type?: unknown}).type === "Not Found") {
      return true;
    }

    const code = readErrorCode(error);
    if (code && PRUNED_ERROR_CODES.has(code)) return true;
  }

  const message = readMessage(error);
  if (!message) return false;
  return /410\b|404\b|version_pruned|has been pruned|transaction not found|not_found/i.test(
    message,
  );
}
