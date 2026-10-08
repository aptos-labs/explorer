import {afterEach, describe, expect, it, vi} from "vitest";
import {
  fetchGenesisTimestamp,
  resolveGenesisTimestamp,
} from "./genesisTimestamp";

const MAINNET_GENESIS_US = "1665609760857472";

afterEach(() => {
  vi.restoreAllMocks();
});

// Covers FEAT-RELEASES-001 (genesis time: unset genesis falls back to transaction 1)
describe("resolveGenesisTimestamp", () => {
  it("uses transaction 1 when the genesis timestamp is unset", () => {
    expect(resolveGenesisTimestamp("0", MAINNET_GENESIS_US)).toEqual({
      timestamp: MAINNET_GENESIS_US,
      version: "1",
    });
    expect(resolveGenesisTimestamp(0, MAINNET_GENESIS_US)).toEqual({
      timestamp: MAINNET_GENESIS_US,
      version: "1",
    });
    expect(
      resolveGenesisTimestamp(undefined, MAINNET_GENESIS_US)?.version,
    ).toBe("1");
  });

  it("keeps a genesis timestamp that is already a real chain time", () => {
    expect(resolveGenesisTimestamp(MAINNET_GENESIS_US, "1")).toEqual({
      timestamp: MAINNET_GENESIS_US,
      version: "0",
    });
  });

  it("treats a too-small genesis timestamp as unset and uses transaction 1", () => {
    // Milliseconds, not microseconds — not a plausible Aptos genesis time.
    expect(
      resolveGenesisTimestamp("1665609760857", MAINNET_GENESIS_US),
    ).toEqual({
      timestamp: MAINNET_GENESIS_US,
      version: "1",
    });
  });

  it("returns null when neither timestamp is usable", () => {
    expect(resolveGenesisTimestamp("0", "0")).toBeNull();
    expect(resolveGenesisTimestamp(null, "")).toBeNull();
    expect(resolveGenesisTimestamp("nope", undefined)).toBeNull();
  });
});

describe("fetchGenesisTimestamp", () => {
  it("reads block 1 when block 0's timestamp is 0", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/blocks/by_height/0")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: {get: () => null},
          json: () => Promise.resolve({block_timestamp: "0"}),
        });
      }
      if (url.includes("/blocks/by_height/1")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: {get: () => null},
          json: () => Promise.resolve({block_timestamp: MAINNET_GENESIS_US}),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        headers: {get: () => null},
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchGenesisTimestamp(
      "devnet",
      "https://fullnode.example/v1",
      {},
    );

    expect(result).toEqual({timestamp: MAINNET_GENESIS_US, version: "1"});
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not fetch block 1 when the genesis timestamp is already set", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/blocks/by_height/0")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: {get: () => null},
          json: () => Promise.resolve({block_timestamp: MAINNET_GENESIS_US}),
        });
      }
      throw new Error(`unexpected ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchGenesisTimestamp(
      "mainnet",
      "https://fullnode.example/v1/",
      {Authorization: "Bearer secret"},
    );

    expect(result).toEqual({timestamp: MAINNET_GENESIS_US, version: "0"});
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toEqual({Authorization: "Bearer secret"});
    expect(init.credentials).toBe("omit");
  });

  it("retries a pruned chain on the archive without the gateway key", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation((url: string, init?: RequestInit) => {
        const authorization = new Headers(init?.headers).get("authorization");
        if (url.startsWith("https://fullnode.example/v1/blocks/by_height/0")) {
          expect(authorization).toBe("Bearer secret");
          return Promise.resolve({
            ok: false,
            status: 410,
            headers: {
              get: (name: string) =>
                name === "x-aptos-archival-endpoint"
                  ? "https://archive.example/v1"
                  : null,
            },
            json: () =>
              Promise.resolve({
                error_code: "block_pruned",
                archival_endpoint: "https://archive.example/v1",
              }),
          });
        }
        if (url.startsWith("https://archive.example/v1/blocks/by_height/0")) {
          expect(authorization).toBeNull();
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: {get: () => null},
            json: () => Promise.resolve({block_timestamp: "0"}),
          });
        }
        if (url.startsWith("https://archive.example/v1/blocks/by_height/1")) {
          expect(authorization).toBeNull();
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: {get: () => null},
            json: () =>
              Promise.resolve({
                block_timestamp: MAINNET_GENESIS_US,
                first_version: "1",
              }),
          });
        }
        throw new Error(`unexpected ${url}`);
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchGenesisTimestamp(
      "mainnet",
      "https://fullnode.example/v1",
      {Authorization: "Bearer secret"},
    );

    expect(result).toEqual({timestamp: MAINNET_GENESIS_US, version: "1"});
  });
});
