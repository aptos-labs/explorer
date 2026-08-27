import {describe, expect, it, vi} from "vitest";
import {
  loadAccountPagePrefetch,
  prefetchAccountPageData,
  prefetchTransactionPageData,
  tryStandardizeRouteAddress,
} from "./prefetchEntityPages";
import {ACCOUNT_LAYOUT_RESOURCE_TYPES} from "./queries";

function queryKeyName(opts: {queryKey: unknown}): string {
  const key = opts.queryKey;
  return Array.isArray(key) ? String(key[0]) : String(key);
}

describe("tryStandardizeRouteAddress", () => {
  it("returns a long-form address for hex inputs", () => {
    expect(tryStandardizeRouteAddress("0x1")).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    );
  });

  it("skips ANS names so loaders do not prefetch until resolution", () => {
    expect(tryStandardizeRouteAddress("alice.apt")).toBeUndefined();
  });

  it("returns undefined for empty input", () => {
    expect(tryStandardizeRouteAddress("")).toBeUndefined();
    expect(tryStandardizeRouteAddress(undefined)).toBeUndefined();
  });
});

describe("prefetchAccountPageData", () => {
  it("schedules layout resources before the full resource list", async () => {
    // Covers FEAT-ACCOUNT-013 — layout-first prefetch order
    const calls: string[] = [];
    const queryClient = {
      prefetchQuery: vi.fn((opts: {queryKey: unknown}) => {
        calls.push(queryKeyName(opts));
        return Promise.resolve();
      }),
    };

    prefetchAccountPageData({
      queryClient: queryClient as never,
      address: "0x1",
      client: {} as never,
      networkName: "mainnet",
      networkValue: "https://api.mainnet.aptoslabs.com/v1",
    });

    const layoutCount = calls.filter(
      (name) => name === "accountResource",
    ).length;
    expect(layoutCount).toBe(ACCOUNT_LAYOUT_RESOURCE_TYPES.length);
    expect(calls).toContain("aptBalance");
    expect(calls).toContain("accountTxnCount");
    expect(calls).toContain("accountTxnVersions");
    expect(calls).not.toContain("accountResources");

    await vi.waitFor(() => {
      expect(calls).toContain("accountResources");
    });

    expect(calls.indexOf("accountResource")).toBeLessThan(
      calls.indexOf("accountResources"),
    );
  });

  it("skips indexer prefetches when GraphQL is unavailable", () => {
    const calls: string[] = [];
    const queryClient = {
      prefetchQuery: vi.fn((opts: {queryKey: unknown}) => {
        calls.push(queryKeyName(opts));
        return Promise.resolve();
      }),
    };

    prefetchAccountPageData({
      queryClient: queryClient as never,
      address: "0x1",
      client: {} as never,
      networkName: "custom" as never,
      networkValue: "https://example.invalid/v1",
    });

    expect(calls).not.toContain("accountTxnCount");
    expect(calls).not.toContain("accountTxnVersions");
    expect(calls).toContain("aptBalance");
  });
});

describe("prefetchTransactionPageData", () => {
  it("prefetches the transaction without awaiting", () => {
    // Covers FEAT-TXN-014 — non-blocking transaction prefetch
    const calls: string[] = [];
    const queryClient = {
      prefetchQuery: vi.fn((opts: {queryKey: unknown}) => {
        calls.push(queryKeyName(opts));
        return Promise.resolve();
      }),
    };

    prefetchTransactionPageData(
      queryClient as never,
      "0xabc",
      {} as never,
      "https://api.mainnet.aptoslabs.com/v1",
    );

    expect(queryClient.prefetchQuery).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["transaction"]);
  });

  it("no-ops on an empty id", () => {
    const queryClient = {
      prefetchQuery: vi.fn(),
    };
    prefetchTransactionPageData(
      queryClient as never,
      "",
      {} as never,
      "https://api.mainnet.aptoslabs.com/v1",
    );
    expect(queryClient.prefetchQuery).not.toHaveBeenCalled();
  });
});

describe("loadAccountPagePrefetch", () => {
  it("does not prefetch ANS names", () => {
    const prefetchQuery = vi.fn();
    loadAccountPagePrefetch({
      address: "alice.apt",
      queryClient: {prefetchQuery} as never,
      search: {network: "mainnet"},
    });
    expect(prefetchQuery).not.toHaveBeenCalled();
  });

  it("starts layout prefetch for a hex address from object search params", () => {
    // Covers FEAT-ACCOUNT-013 — loader search is TanStack's parsed object
    const prefetchQuery = vi.fn(() => Promise.resolve());
    loadAccountPagePrefetch({
      address: "0x1",
      queryClient: {prefetchQuery} as never,
      search: {network: "mainnet", page: "2"},
    });
    expect(prefetchQuery.mock.calls.length).toBeGreaterThan(0);
  });
});
