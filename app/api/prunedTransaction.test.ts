import {describe, expect, it} from "vitest";
import {isPrunedOrNotFoundError} from "./prunedTransaction";

// Covers FEAT-TXN-014 — detect pruned / not-found REST errors for indexer fallback

describe("isPrunedOrNotFoundError", () => {
  it("matches HTTP 410 and 404 status", () => {
    expect(isPrunedOrNotFoundError({status: 410})).toBe(true);
    expect(isPrunedOrNotFoundError({status: 404})).toBe(true);
    expect(isPrunedOrNotFoundError({status: 500})).toBe(false);
  });

  it("matches ResponseError NOT_FOUND", () => {
    expect(isPrunedOrNotFoundError({type: "Not Found"})).toBe(true);
  });

  it("matches version_pruned error_code on the body or nested data", () => {
    expect(
      isPrunedOrNotFoundError({
        status: 410,
        data: {error_code: "version_pruned"},
      }),
    ).toBe(true);
    expect(isPrunedOrNotFoundError({error_code: "transaction_not_found"})).toBe(
      true,
    );
  });

  it("matches Aptos API error messages from the legacy REST client", () => {
    expect(
      isPrunedOrNotFoundError(
        new Error(
          'Aptos API error 410: {"error_code":"version_pruned","message":"Ledger version(1) has been pruned"}',
        ),
      ),
    ).toBe(true);
    expect(
      isPrunedOrNotFoundError(new Error("Request failed: Aptos API error 404")),
    ).toBe(true);
  });

  it("does not match unrelated failures", () => {
    expect(isPrunedOrNotFoundError(new Error("Network error"))).toBe(false);
    expect(isPrunedOrNotFoundError({status: 429})).toBe(false);
    expect(isPrunedOrNotFoundError(null)).toBe(false);
    expect(isPrunedOrNotFoundError(undefined)).toBe(false);
  });
});
