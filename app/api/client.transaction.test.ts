import {afterEach, describe, expect, it, vi} from "vitest";
import {resetArchivalEndpointCache} from "./archivalNode";
import {getTransaction} from "./client";
import {isIndexerSourced} from "./indexerTransaction";

// Covers FEAT-TXN-014 — REST prune → indexer reconstruction

const indexerUserTxn = {
  version: "685",
  sender: "0x1",
  sequence_number: 0,
  max_gas_amount: 1,
  gas_unit_price: 100,
  expiration_timestamp_secs: "2022-10-12T21:26:49",
  timestamp: "2022-10-12T21:26:20.299882",
  entry_function_id_str: "0x1::coin::transfer",
};

describe("getTransaction indexer fallback", () => {
  afterEach(() => {
    resetArchivalEndpointCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the fullnode transaction when REST succeeds", async () => {
    const restTxn = {type: "user_transaction", version: "10", hash: "0xabc"};
    const client = {
      getTransactionByVersion: vi.fn().mockResolvedValue(restTxn),
      queryIndexer: vi.fn(),
    };

    const result = await getTransaction("10", client as never);
    expect(result).toEqual(restTxn);
    expect(client.queryIndexer).not.toHaveBeenCalled();
  });

  it("reconstructs from the indexer when REST reports the version as pruned", async () => {
    const client = {
      getTransactionByVersion: vi.fn().mockRejectedValue({
        status: 410,
        data: {error_code: "version_pruned"},
        message: "Ledger version(685) has been pruned",
      }),
      queryIndexer: vi.fn().mockResolvedValue({
        user_transactions: [indexerUserTxn],
        fungible_asset_activities: [
          {amount: 200, is_gas_fee: true, is_transaction_success: true},
        ],
      }),
    };

    const result = await getTransaction("685", client as never);
    expect(result.type).toBe("user_transaction");
    expect(isIndexerSourced(result)).toBe(true);
    expect("gas_used" in result && result.gas_used).toBe("2");
    expect(client.queryIndexer).toHaveBeenCalledTimes(1);
  });

  it("does not query the indexer for non-prune errors", async () => {
    const client = {
      getTransactionByVersion: vi.fn().mockRejectedValue({
        status: 500,
        message: "internal",
      }),
      queryIndexer: vi.fn(),
    };

    await expect(getTransaction("685", client as never)).rejects.toMatchObject({
      type: "Unhandled",
    });
    expect(client.queryIndexer).not.toHaveBeenCalled();
  });

  it("surfaces NOT_FOUND when both REST and the indexer miss", async () => {
    const client = {
      getTransactionByHash: vi.fn().mockRejectedValue({status: 404}),
      queryIndexer: vi.fn(),
    };

    await expect(
      getTransaction("0xdead", client as never),
    ).rejects.toMatchObject({
      type: "Not Found",
    });
    expect(client.queryIndexer).not.toHaveBeenCalled();
  });

  it("loads a pruned hash from archival REST without forwarding credentials", async () => {
    const txn = {type: "user_transaction", version: "1", hash: "0xdead"};
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        if (url.hostname === "archive.mainnet.aptoslabs.com") {
          expect(new Headers(init?.headers).get("Authorization")).toBeNull();
          expect(url.pathname).toBe("/v1/transactions/by_hash/0xdead");
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => txn,
          };
        }
        return {
          ok: false,
          status: 410,
          headers: new Headers(),
          json: async () => ({
            archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = {
      getTransactionByHash: vi.fn().mockRejectedValue({status: 404}),
      queryIndexer: vi.fn(),
      config: {
        fullnode: "https://api.mainnet.aptoslabs.com/v1",
        clientConfig: {HEADERS: {Authorization: "Bearer secret"}},
      },
    };

    const result = await getTransaction("0xdead", client as never);
    expect(result).toEqual(txn);
    expect(client.queryIndexer).not.toHaveBeenCalled();
  });

  it("loads a pruned version from archival REST before the indexer", async () => {
    const txn = {type: "block_metadata_transaction", version: "1"};
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        if (url.hostname === "archive.mainnet.aptoslabs.com") {
          expect(new Headers(init?.headers).get("Authorization")).toBeNull();
          expect(url.pathname).toBe("/v1/transactions/by_version/1");
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => txn,
          };
        }
        return {
          ok: false,
          status: 410,
          headers: new Headers(),
          json: async () => ({
            archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = {
      getTransactionByVersion: vi.fn().mockRejectedValue({
        status: 410,
        data: {error_code: "version_pruned"},
      }),
      queryIndexer: vi.fn(),
      config: {fullnode: "https://api.mainnet.aptoslabs.com/v1"},
    };

    const result = await getTransaction("1", client as never);
    expect(result).toEqual(txn);
    expect(client.queryIndexer).not.toHaveBeenCalled();
  });

  it("retries archival without credentials when the SDK archive retry 401s", async () => {
    const txn = {type: "user_transaction", version: "1", hash: "0xdead"};
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        if (url.hostname === "archive.mainnet.aptoslabs.com") {
          expect(new Headers(init?.headers).get("Authorization")).toBeNull();
          return {
            ok: true,
            status: 200,
            headers: new Headers(),
            json: async () => txn,
          };
        }
        return {
          ok: false,
          status: 410,
          headers: new Headers(),
          json: async () => ({
            archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
          }),
        };
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = {
      getTransactionByHash: vi.fn().mockRejectedValue({
        status: 401,
        message: "Unauthorized: API key not found",
      }),
      queryIndexer: vi.fn(),
      config: {
        fullnode: "https://api.mainnet.aptoslabs.com/v1",
        clientConfig: {HEADERS: {Authorization: "Bearer secret"}},
      },
    };

    const result = await getTransaction("0xdead", client as never);
    expect(result).toEqual(txn);
    expect(client.queryIndexer).not.toHaveBeenCalled();
  });
});
