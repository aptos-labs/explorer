import {describe, expect, it} from "vitest";
import {planTransactionsPrimeBatch} from "./useGetTransaction";

describe("planTransactionsPrimeBatch", () => {
  it("returns null for an empty input", () => {
    expect(planTransactionsPrimeBatch([])).toBeNull();
  });

  it("returns {start, limit} that covers a single version", () => {
    expect(planTransactionsPrimeBatch([1_000_000])).toEqual({
      start: 1_000_000,
      limit: 1,
    });
  });

  it("returns the smallest range that covers all versions", () => {
    // Sequential or near-sequential — the common /transactions case.
    const plan = planTransactionsPrimeBatch([
      1_000_000, 1_000_001, 1_000_002, 1_000_005,
    ]);
    expect(plan).toEqual({start: 1_000_000, limit: 6});
  });

  it("is order-independent", () => {
    const a = planTransactionsPrimeBatch([3, 1, 2]);
    const b = planTransactionsPrimeBatch([1, 2, 3]);
    expect(a).toEqual(b);
  });

  it("returns null when the version range is too wide to batch", () => {
    // Span of 1000 — too sparse to be worth one fat REST call.
    expect(planTransactionsPrimeBatch([1, 1001])).toBeNull();
  });

  it("returns null on non-finite inputs (defensive)", () => {
    expect(planTransactionsPrimeBatch([Number.NaN])).toBeNull();
    expect(
      planTransactionsPrimeBatch([Number.POSITIVE_INFINITY, 1]),
    ).toBeNull();
  });

  it("handles the dense default page (25 sequential versions)", () => {
    const versions = Array.from({length: 25}, (_, i) => 1_000_000 + i);
    expect(planTransactionsPrimeBatch(versions)).toEqual({
      start: 1_000_000,
      limit: 25,
    });
  });
});
