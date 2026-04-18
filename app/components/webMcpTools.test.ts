import {describe, expect, it, vi} from "vitest";
import {
  buildWebMcpTools,
  isAddressLike,
  networkSearch,
  type NavigateFn,
} from "./webMcpTools";

function setup() {
  const navigate = vi.fn<NavigateFn>().mockResolvedValue(undefined);
  const tools = buildWebMcpTools(navigate);
  const byName = Object.fromEntries(tools.map((t) => [t.name, t] as const));
  return {navigate, tools, byName};
}

describe("networkSearch", () => {
  it("returns empty object for mainnet / undefined", () => {
    expect(networkSearch()).toEqual({});
    expect(networkSearch("mainnet")).toEqual({});
  });
  it("passes through non-mainnet networks", () => {
    expect(networkSearch("testnet")).toEqual({network: "testnet"});
    expect(networkSearch("devnet")).toEqual({network: "devnet"});
    expect(networkSearch("local")).toEqual({network: "local"});
  });
});

describe("isAddressLike", () => {
  it.each([
    "0x1",
    "0x0000000000000000000000000000000000000000000000000000000000000001",
    "0xabcDEF",
    "alice.apt",
    "aptos-labs.apt",
  ])("accepts %s", (v) => {
    expect(isAddressLike(v)).toBe(true);
  });
  it.each([
    "",
    "bob",
    "0x",
    "xyz.apt.foo",
    "0xGHIJ",
    "foo",
  ])("rejects %s", (v) => {
    expect(isAddressLike(v)).toBe(false);
  });
});

describe("buildWebMcpTools", () => {
  it("exposes the expected tool names", () => {
    const {tools} = setup();
    expect(tools.map((t) => t.name)).toEqual([
      "search_explorer",
      "open_transaction",
      "open_account",
      "open_block",
      "open_coin",
    ]);
  });

  it("marks every tool as read-only", () => {
    const {tools} = setup();
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint).toBe(true);
    }
  });

  it("uses valid WebMCP tool names (alphanumeric, _, -, .)", () => {
    const {tools} = setup();
    const re = /^[A-Za-z0-9_.-]{1,128}$/;
    for (const tool of tools) {
      expect(tool.name).toMatch(re);
      expect(tool.description.length).toBeGreaterThan(0);
    }
  });

  describe("search_explorer", () => {
    it("navigates to /?search= and preserves network", async () => {
      const {navigate, byName} = setup();
      const result = await byName.search_explorer.execute({
        query: "alice.apt",
        network: "testnet",
      });
      expect(navigate).toHaveBeenCalledWith({
        to: "/",
        search: {search: "alice.apt", network: "testnet"},
      });
      expect(result).toEqual({ok: true, path: "/?search=alice.apt"});
    });

    it("omits network for mainnet", async () => {
      const {navigate, byName} = setup();
      await byName.search_explorer.execute({query: "0x1"});
      expect(navigate).toHaveBeenCalledWith({
        to: "/",
        search: {search: "0x1"},
      });
    });

    it("throws when query is missing", async () => {
      const {byName} = setup();
      await expect(byName.search_explorer.execute({})).rejects.toThrow(
        /'query' is required/,
      );
    });
  });

  describe("open_transaction", () => {
    it("accepts a decimal version", async () => {
      const {navigate, byName} = setup();
      const r = await byName.open_transaction.execute({id: "123456789"});
      expect(navigate).toHaveBeenCalledWith({
        to: "/txn/123456789",
        search: {},
      });
      expect(r.path).toBe("/txn/123456789");
    });

    it("accepts a hex hash and tab", async () => {
      const {navigate, byName} = setup();
      await byName.open_transaction.execute({
        id: "0xabcdef",
        tab: "events",
        network: "testnet",
      });
      expect(navigate).toHaveBeenCalledWith({
        to: "/txn/0xabcdef/events",
        search: {network: "testnet"},
      });
    });

    it("rejects junk ids", async () => {
      const {byName} = setup();
      await expect(
        byName.open_transaction.execute({id: "not-a-hash"}),
      ).rejects.toThrow();
    });
  });

  describe("open_account", () => {
    it("navigates to address page", async () => {
      const {navigate, byName} = setup();
      await byName.open_account.execute({
        address: "0x1",
        tab: "modules",
      });
      expect(navigate).toHaveBeenCalledWith({
        to: "/account/0x1/modules",
        search: {},
      });
    });

    it("accepts ANS names", async () => {
      const {navigate, byName} = setup();
      await byName.open_account.execute({address: "alice.apt"});
      expect(navigate).toHaveBeenCalledWith({
        to: "/account/alice.apt",
        search: {},
      });
    });

    it("rejects invalid inputs", async () => {
      const {byName} = setup();
      await expect(
        byName.open_account.execute({address: "not-an-address"}),
      ).rejects.toThrow();
    });
  });

  describe("open_block", () => {
    it("accepts a non-negative integer", async () => {
      const {navigate, byName} = setup();
      await byName.open_block.execute({height: 42});
      expect(navigate).toHaveBeenCalledWith({to: "/block/42", search: {}});
    });

    it("rejects negatives / non-integers / non-numbers", async () => {
      const {byName} = setup();
      await expect(byName.open_block.execute({height: -1})).rejects.toThrow();
      await expect(byName.open_block.execute({height: 1.5})).rejects.toThrow();
      await expect(byName.open_block.execute({height: "42"})).rejects.toThrow();
    });
  });

  describe("open_coin", () => {
    it("accepts a fully-qualified Move type", async () => {
      const {navigate, byName} = setup();
      await byName.open_coin.execute({
        coinType: "0x1::aptos_coin::AptosCoin",
      });
      expect(navigate).toHaveBeenCalledWith({
        to: `/coin/${encodeURIComponent("0x1::aptos_coin::AptosCoin")}`,
        search: {},
      });
    });

    it("rejects partial types", async () => {
      const {byName} = setup();
      await expect(
        byName.open_coin.execute({coinType: "0x1::coin"}),
      ).rejects.toThrow();
    });
  });
});
