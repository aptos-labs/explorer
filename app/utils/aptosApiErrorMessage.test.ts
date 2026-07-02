// Covers FEAT-MODULES-001 — Run tab simulate API error messaging
import {describe, expect, it} from "vitest";
import {formatAptosApiErrorForDisplay} from "./aptosApiErrorMessage";

describe("formatAptosApiErrorForDisplay", () => {
  it("maps 401 per-IP blocking to actionable copy with Settings hint", () => {
    const err = new Error(
      'Request to [Fullnode]: POST https://api.mainnet.aptoslabs.com/v1/transactions/simulate failed with status: (code:401) and response body: "Unauthorized: Rejected due to a per-IP blocking rule for this application"',
    );
    const result = formatAptosApiErrorForDisplay(err);
    expect(result.suggestSettings).toBe(true);
    expect(result.message).toContain("authentication rejected");
    expect(result.message).toContain("not a Move execution failure");
  });

  it("maps 429 rate limit errors with Settings hint", () => {
    const result = formatAptosApiErrorForDisplay(
      new Error("Request failed with status 429: rate limit exceeded"),
    );
    expect(result.suggestSettings).toBe(true);
    expect(result.message).toContain("rate limited");
  });

  it("passes through other errors unchanged", () => {
    const result = formatAptosApiErrorForDisplay(
      new Error("EXECUTION_FAILED: abort code 1"),
    );
    expect(result.suggestSettings).toBe(false);
    expect(result.message).toBe("EXECUTION_FAILED: abort code 1");
  });
});
