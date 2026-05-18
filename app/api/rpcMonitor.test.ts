import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {
  classifyRpcUrl,
  extractRpcPath,
  getRpcMonitorStats,
  recordRpcRequest,
  resetRpcMonitor,
} from "./rpcMonitor";

describe("rpcMonitor", () => {
  beforeEach(() => {
    resetRpcMonitor();
    vi.stubGlobal("console", {...console, info: vi.fn()});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("increments totals and buckets by api/source", () => {
    recordRpcRequest({
      source: "sdk",
      api: "fullnode",
      method: "GET",
      path: "/v1/accounts/0x1",
      url: "https://fullnode.mainnet.aptoslabs.com/v1/accounts/0x1",
      status: "success",
      statusCode: 200,
      durationMs: 12,
    });

    recordRpcRequest({
      source: "legacy",
      api: "fullnode",
      method: "GET",
      path: "/v1/transactions",
      url: "https://fullnode.mainnet.aptoslabs.com/v1/transactions",
      status: "error",
      statusCode: 500,
      durationMs: 40,
    });

    const stats = getRpcMonitorStats();
    expect(stats.total).toBe(2);
    expect(stats.success).toBe(1);
    expect(stats.error).toBe(1);
    expect(stats.byApi.fullnode).toBe(2);
    expect(stats.bySource.sdk).toBe(1);
    expect(stats.bySource.legacy).toBe(1);
    expect(stats.recent).toHaveLength(2);
    expect(stats.recent[0]?.id).toBe(2);
  });

  it("classifies indexer and faucet URLs", () => {
    expect(
      classifyRpcUrl("https://indexer.mainnet.aptoslabs.com/v1/graphql"),
    ).toBe("indexer");
    expect(classifyRpcUrl("https://faucet.devnet.aptoslabs.com/mint")).toBe(
      "faucet",
    );
    expect(
      classifyRpcUrl("https://fullnode.mainnet.aptoslabs.com/v1/ledger/info"),
    ).toBe("fullnode");
  });

  it("extracts path and search from URLs", () => {
    expect(
      extractRpcPath(
        "https://fullnode.mainnet.aptoslabs.com/v1/transactions?limit=10",
      ),
    ).toBe("/v1/transactions?limit=10");
  });

  it("getRpcMonitorStats keeps referential equality until the next update", () => {
    const before = getRpcMonitorStats();
    expect(getRpcMonitorStats()).toBe(before);

    recordRpcRequest({
      source: "sdk",
      api: "fullnode",
      method: "GET",
      path: "/v1/ledger/info",
      url: "https://fullnode.mainnet.aptoslabs.com/v1/ledger/info",
      status: "success",
      statusCode: 200,
      durationMs: 1,
    });

    const after = getRpcMonitorStats();
    expect(after).not.toBe(before);
    expect(getRpcMonitorStats()).toBe(after);
  });

  it("resetRpcMonitor clears counters", () => {
    recordRpcRequest({
      source: "sdk",
      api: "fullnode",
      method: "POST",
      path: "/v1/transactions/simulate",
      url: "https://fullnode.mainnet.aptoslabs.com/v1/transactions/simulate",
      status: "success",
      statusCode: 200,
      durationMs: 5,
    });

    resetRpcMonitor();
    const stats = getRpcMonitorStats();
    expect(stats.total).toBe(0);
    expect(stats.recent).toHaveLength(0);
  });
});
