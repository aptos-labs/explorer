import {afterEach, describe, expect, it, vi} from "vitest";
import {resetArchivalEndpointCache} from "./archivalNode";
import {getBlockByHeight, getBlockByVersion} from "./v2";

// Covers FEAT-BLOCK-001 / FEAT-TXN-014 — pruned blocks load from the archive
// node after the serving fullnode (and indexer, which has no full block body)
// miss.

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body,
    body: {cancel: vi.fn()} as unknown as ReadableStream,
  };
}

describe("getBlock archival fallback", () => {
  afterEach(() => {
    resetArchivalEndpointCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the fullnode block when REST succeeds", async () => {
    const block = {block_height: "10"};
    const aptos = {
      getBlockByHeight: vi.fn().mockResolvedValue(block),
      config: {fullnode: "https://api.mainnet.aptoslabs.com/v1"},
    };
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getBlockByHeight({height: 10, withTransactions: true}, aptos as never),
    ).resolves.toEqual(block);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads a pruned height from the archive node without credentials", async () => {
    const block = {block_height: "1", first_version: "0"};
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        if (url.hostname === "archive.mainnet.aptoslabs.com") {
          expect(new Headers(init?.headers).get("Authorization")).toBeNull();
          expect(url.pathname).toBe("/v1/blocks/by_height/1");
          return jsonResponse(200, block);
        }
        return jsonResponse(410, {
          archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const aptos = {
      getBlockByHeight: vi.fn().mockRejectedValue({
        status: 410,
        data: {error_code: "version_pruned"},
      }),
      queryIndexer: vi.fn(),
      config: {
        fullnode: "https://api.mainnet.aptoslabs.com/v1",
        clientConfig: {HEADERS: {Authorization: "Bearer secret"}},
      },
    };

    await expect(
      getBlockByHeight({height: 1, withTransactions: true}, aptos as never),
    ).resolves.toEqual(block);
    expect(aptos.queryIndexer).not.toHaveBeenCalled();
  });

  it("loads a pruned version from the archive node", async () => {
    const block = {block_height: "0", first_version: "1"};
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.hostname === "archive.mainnet.aptoslabs.com") {
        expect(url.pathname).toBe("/v1/blocks/by_version/1");
        return jsonResponse(200, block);
      }
      return jsonResponse(410, {
        archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const aptos = {
      getBlockByVersion: vi.fn().mockRejectedValue({status: 404}),
      config: {fullnode: "https://api.mainnet.aptoslabs.com/v1"},
    };

    await expect(
      getBlockByVersion({version: 1, withTransactions: false}, aptos as never),
    ).resolves.toEqual(block);
  });
});
