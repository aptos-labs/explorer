/**
 * User-facing messages for Aptos fullnode / API gateway errors (browser SDK paths).
 * Covers FEAT-MODULES-001 — Run tab simulate and similar direct API calls.
 */

export type AptosApiErrorDisplay = {
  message: string;
  suggestSettings: boolean;
};

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

/**
 * Map raw SDK / fetch errors to actionable copy. Simulation failures from
 * HTTP 401/429 are gateway/auth issues, not Move VM execution results.
 */
export function formatAptosApiErrorForDisplay(
  error: unknown,
): AptosApiErrorDisplay {
  const raw = errorText(error).trim() || "Request failed";
  const lower = raw.toLowerCase();

  const isUnauthorized =
    lower.includes("401") ||
    lower.includes("unauthorized") ||
    lower.includes("per-ip blocking");
  const isRateLimited =
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests");

  if (isUnauthorized) {
    return {
      message:
        "Simulation could not reach the Aptos API (authentication rejected). " +
        "This is not a Move execution failure. The gateway blocked the request—often " +
        "because of a missing or invalid API key, or per-IP restrictions for this application.",
      suggestSettings: true,
    };
  }

  if (isRateLimited) {
    return {
      message:
        "Simulation could not reach the Aptos API (rate limited). " +
        "This is not a Move execution failure. Try again later or add your own API key " +
        "for a dedicated rate limit.",
      suggestSettings: true,
    };
  }

  return {message: raw, suggestSettings: false};
}
