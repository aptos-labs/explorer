import {describe, expect, it} from "vitest";
import {
  blockListSearchParams,
  DEFAULT_BLOCK_PAGE_SIZE,
  MAX_BLOCK_PAGE_SIZE,
  parseBlockListQuery,
  parseHeightParam,
  shiftBlockListQuery,
  windowForQuery,
} from "./blockRange";

// Covers FEAT-BLOCKS-001 — height-range pagination, not page indexes.

describe("parseHeightParam", () => {
  it("accepts non-negative integers", () => {
    expect(parseHeightParam("0")).toBe(0);
    expect(parseHeightParam("1000")).toBe(1000);
    expect(parseHeightParam(" 42 ")).toBe(42);
  });

  it("rejects blank, signed, decimal, and unsafe values", () => {
    expect(parseHeightParam(null)).toBeUndefined();
    expect(parseHeightParam("")).toBeUndefined();
    expect(parseHeightParam("-1")).toBeUndefined();
    expect(parseHeightParam("10.5")).toBeUndefined();
    expect(parseHeightParam("1e3")).toBeUndefined();
    expect(parseHeightParam("00")).toBeUndefined();
    expect(parseHeightParam("9999999999999999999")).toBeUndefined();
  });
});

describe("parseBlockListQuery", () => {
  it("follows the live tip when no range is set", () => {
    expect(parseBlockListQuery({})).toEqual({
      kind: "live",
      pageSize: DEFAULT_BLOCK_PAGE_SIZE,
    });
  });

  it("reads an inclusive start/end range", () => {
    expect(parseBlockListQuery({start: "980", end: "999"})).toEqual({
      kind: "range",
      range: {start: 980, end: 999},
      pageSize: 20,
    });
  });

  it("orders a reversed range so start is the older height", () => {
    expect(parseBlockListQuery({start: "999", end: "980"}).kind).toBe("range");
    expect(parseBlockListQuery({start: "999", end: "980"})).toMatchObject({
      range: {start: 980, end: 999},
    });
  });

  it("keeps the newer end when the range exceeds the fetch cap", () => {
    const query = parseBlockListQuery({start: "1", end: "500"});
    expect(query).toMatchObject({
      kind: "range",
      range: {start: 500 - MAX_BLOCK_PAGE_SIZE + 1, end: 500},
      pageSize: MAX_BLOCK_PAGE_SIZE,
    });
  });

  it("treats start alone as the legacy newest-height cursor", () => {
    expect(parseBlockListQuery({start: "1000"})).toEqual({
      kind: "cursor",
      newest: 1000,
      pageSize: DEFAULT_BLOCK_PAGE_SIZE,
    });
  });

  it("ignores invalid params and stays on the live tip", () => {
    expect(parseBlockListQuery({start: "nope", end: "-3"})).toEqual({
      kind: "live",
      pageSize: DEFAULT_BLOCK_PAGE_SIZE,
    });
  });
});

describe("windowForQuery", () => {
  it("waits for the ledger height on the live tip", () => {
    const live = parseBlockListQuery({});
    expect(windowForQuery(live, undefined)).toBeUndefined();
    expect(windowForQuery(live, 1000)).toEqual({start: 981, end: 1000});
  });

  it("clamps the live window at height 0", () => {
    expect(windowForQuery(parseBlockListQuery({}), 5)).toEqual({
      start: 0,
      end: 5,
    });
  });

  it("expands a legacy cursor into a default-sized window", () => {
    expect(
      windowForQuery(parseBlockListQuery({start: "1000"}), undefined),
    ).toEqual({start: 981, end: 1000});
  });
});

describe("shiftBlockListQuery", () => {
  const ledger = 1000;

  it("moves to the previous frozen range", () => {
    const next = shiftBlockListQuery({start: 981, end: 1000}, "older", ledger);
    expect(next).toEqual({
      kind: "range",
      range: {start: 961, end: 980},
      pageSize: 20,
    });
  });

  it("moves to the next frozen range", () => {
    const next = shiftBlockListQuery({start: 941, end: 960}, "newer", ledger);
    expect(next).toEqual({
      kind: "range",
      range: {start: 961, end: 980},
      pageSize: 20,
    });
  });

  it("returns to the live tip when the next window would reach it", () => {
    expect(
      shiftBlockListQuery({start: 961, end: 980}, "newer", ledger),
    ).toEqual({kind: "live", pageSize: DEFAULT_BLOCK_PAGE_SIZE});
  });

  it("does not page past height 0 or past the tip", () => {
    expect(
      shiftBlockListQuery({start: 0, end: 5}, "older", ledger),
    ).toBeUndefined();
    expect(
      shiftBlockListQuery({start: 981, end: 1000}, "newer", ledger),
    ).toBeUndefined();
  });

  it("keeps a custom range length when stepping", () => {
    expect(
      shiftBlockListQuery({start: 100, end: 149}, "older", ledger),
    ).toEqual({
      kind: "range",
      range: {start: 50, end: 99},
      pageSize: 50,
    });
    expect(
      shiftBlockListQuery({start: 100, end: 149}, "newer", ledger),
    ).toEqual({
      kind: "range",
      range: {start: 150, end: 199},
      pageSize: 50,
    });
  });

  it("realigns a short genesis window with the default page", () => {
    expect(shiftBlockListQuery({start: 0, end: 5}, "newer", 25)).toEqual({
      kind: "live",
      pageSize: DEFAULT_BLOCK_PAGE_SIZE,
    });
    expect(shiftBlockListQuery({start: 0, end: 5}, "newer", 10_000)).toEqual({
      kind: "range",
      range: {start: 6, end: 25},
      pageSize: 20,
    });
  });
});

describe("blockListSearchParams", () => {
  it("writes both ends of a frozen range and clears them for the live tip", () => {
    expect(
      blockListSearchParams({
        kind: "range",
        range: {start: 961, end: 980},
        pageSize: 20,
      }),
    ).toEqual({start: "961", end: "980"});
    expect(
      blockListSearchParams({kind: "live", pageSize: DEFAULT_BLOCK_PAGE_SIZE}),
    ).toEqual({});
    expect(
      blockListSearchParams({kind: "cursor", newest: 1000, pageSize: 20}),
    ).toEqual({});
  });
});
