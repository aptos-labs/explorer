import {afterEach, describe, expect, it, vi} from "vitest";
import {resetArchivalEndpointCache} from "../../../api/archivalNode";
import {
  createFallbackAddressResult,
  groupSearchResults,
  handleTransaction,
} from "./searchUtils";

describe("createFallbackAddressResult", () => {
  it("returns an address result for valid inputs", () => {
    const result = createFallbackAddressResult("0x1");
    expect(result).toEqual(
      expect.objectContaining({
        label:
          "Address 0x0000000000000000000000000000000000000000000000000000000000000001",
        to: "/account/0x0000000000000000000000000000000000000000000000000000000000000001",
        identiconKey:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
        type: "address",
      }),
    );
  });

  it("returns null for invalid inputs", () => {
    expect(createFallbackAddressResult("not-an-address")).toBeNull();
  });
});

describe("FEAT-SEARCH-002 — handleTransaction", () => {
  afterEach(() => {
    resetArchivalEndpointCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns a transaction result when archival confirms a pruned hash", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        if (url.hostname === "archive.mainnet.aptoslabs.com") {
          expect(new Headers(init?.headers).get("Authorization")).toBeNull();
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => ({hash: "0xdead"}),
            body: {cancel: vi.fn()} as unknown as ReadableStream,
          };
        }
        return {
          ok: false,
          status: url.pathname.endsWith("/by_version/0") ? 410 : 404,
          headers: new Headers(),
          json: async () => ({
            archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
          }),
          body: {cancel: vi.fn()} as unknown as ReadableStream,
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = {
      config: {
        fullnode: "https://api.mainnet.aptoslabs.com/v1",
        clientConfig: {HEADERS: {Authorization: "Bearer secret"}},
      },
    };

    await expect(handleTransaction("0xdead", client as never)).resolves.toEqual(
      expect.objectContaining({
        label: "Transaction 0xdead",
        to: "/txn/0xdead",
        type: "transaction",
      }),
    );
  });
});

describe("FEAT-SEARCH-003 — groupSearchResults address merge", () => {
  it("merges account, object, and address rows into one Addresses group", () => {
    const grouped = groupSearchResults([
      {label: "Account 0xabc", to: "/object/0xabc", type: "account"},
      {label: "Object 0xabc", to: "/object/0xabc", type: "object"},
      {label: "Address 0xabc", to: "/object/0xabc", type: "address"},
    ]);

    const headers = grouped.filter((result) => result.isGroupHeader);
    expect(headers).toHaveLength(1);
    expect(headers[0]?.labelKey).toBe("search.group.address");
    // Rows keep their own destinations and type chips.
    expect(grouped.filter((result) => !result.isGroupHeader)).toHaveLength(3);
  });

  it("keeps assets, transactions, and blocks as separate groups", () => {
    const grouped = groupSearchResults([
      {label: "Coin USDC", to: "/coin/0x1", type: "coin"},
      {
        label: "Fungible Asset 0xfee",
        to: "/fungible_asset/0xfee",
        type: "fungible-asset",
      },
      {label: "Transaction 0xdead", to: "/txn/0xdead", type: "transaction"},
      {label: "Block 123", to: "/block/123", type: "block"},
      {label: "Account 0xabc", to: "/object/0xabc", type: "account"},
    ]);

    const headerKeys = grouped
      .filter((result) => result.isGroupHeader)
      .map((result) => result.labelKey);
    expect(headerKeys).toEqual([
      "search.group.asset",
      "search.group.address",
      "search.group.transaction",
      "search.group.block",
    ]);
  });

  it("returns input unchanged for an empty list", () => {
    expect(groupSearchResults([])).toEqual([]);
  });
});
