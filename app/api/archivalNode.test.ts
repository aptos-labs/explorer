import {afterEach, describe, expect, it, vi} from "vitest";
import {
  parseArchivalEndpoint,
  resetArchivalEndpointCache,
  resolveArchivalEndpoint,
  transactionHashExists,
  fetchTransactionFromArchival,
} from "./archivalNode";

// Covers FEAT-SEARCH-002 / FEAT-TXN-014 — pruned txn hashes are confirmed
// against the node's advertised archival endpoint without API credentials.

function host(url: string): string {
  return new URL(url).hostname;
}

function jsonResponse(status: number, body: unknown, headerInit?: HeadersInit) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headerInit),
    json: async () => body,
    text: async () => JSON.stringify(body),
    body: {cancel: vi.fn()} as unknown as ReadableStream,
  };
}

describe("parseArchivalEndpoint", () => {
  it("reads archival_endpoint from a 410 JSON body", () => {
    expect(
      parseArchivalEndpoint({
        error_code: "version_pruned",
        archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
      }),
    ).toBe("https://archive.mainnet.aptoslabs.com/v1");
  });

  it("rejects non-https archival URLs when the origin is https", () => {
    expect(
      parseArchivalEndpoint(
        {archival_endpoint: "http://archive.example/v1"},
        "https://api.mainnet.aptoslabs.com/v1",
      ),
    ).toBeUndefined();
  });

  it("returns undefined when no endpoint is advertised", () => {
    expect(
      parseArchivalEndpoint({error_code: "version_pruned"}),
    ).toBeUndefined();
    expect(parseArchivalEndpoint(null)).toBeUndefined();
  });
});

describe("resolveArchivalEndpoint", () => {
  afterEach(() => {
    resetArchivalEndpointCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("discovers the archival URL from a pruned version-0 probe", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL) =>
      jsonResponse(410, {
        error_code: "version_pruned",
        archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const endpoint = await resolveArchivalEndpoint(
      "https://api.mainnet.aptoslabs.com/v1",
    );
    expect(endpoint).toBe("https://archive.mainnet.aptoslabs.com/v1");
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://api.mainnet.aptoslabs.com/v1/transactions/by_version/0",
    );
  });

  it("falls back to the x-aptos-archival-endpoint response header", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        410,
        {error_code: "version_pruned"},
        {
          "x-aptos-archival-endpoint":
            "https://archive.mainnet.aptoslabs.com/v1",
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      resolveArchivalEndpoint("https://api.mainnet.aptoslabs.com/v1"),
    ).resolves.toBe("https://archive.mainnet.aptoslabs.com/v1");
  });

  it("caches a miss when version 0 is still on the node", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {version: "0"}));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      resolveArchivalEndpoint("https://api.mainnet.aptoslabs.com/v1"),
    ).resolves.toBeNull();
    await expect(
      resolveArchivalEndpoint("https://api.mainnet.aptoslabs.com/v1"),
    ).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("transactionHashExists", () => {
  afterEach(() => {
    resetArchivalEndpointCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns true when the fullnode has the hash and forwards credentials there", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(host(String(input))).toBe("api.mainnet.aptoslabs.com");
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer secret");
        return jsonResponse(200, {hash: "0xabc"});
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      transactionHashExists("https://api.mainnet.aptoslabs.com/v1", "0xabc", {
        Authorization: "Bearer secret",
      }),
    ).resolves.toBe(true);
  });

  it("retries pruned hashes against archival without forwarding credentials", async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const headers = new Headers(init?.headers);
        if (host(url) === "archive.mainnet.aptoslabs.com") {
          expect(headers.get("Authorization")).toBeNull();
          return jsonResponse(200, {hash: "0xdead"});
        }
        expect(host(url)).toBe("api.mainnet.aptoslabs.com");
        expect(headers.get("Authorization")).toBe("Bearer secret");
        if (url.endsWith("/transactions/by_version/0")) {
          return jsonResponse(410, {
            archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
          });
        }
        return jsonResponse(404, {error_code: "transaction_not_found"});
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      transactionHashExists("https://api.mainnet.aptoslabs.com/v1", "0xdead", {
        Authorization: "Bearer secret",
      }),
    ).resolves.toBe(true);
  });

  it("returns false when neither the node nor archival has the hash", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/transactions/by_version/0")) {
        return jsonResponse(410, {
          archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
        });
      }
      return jsonResponse(404, {error_code: "transaction_not_found"});
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      transactionHashExists(
        "https://api.mainnet.aptoslabs.com/v1",
        "0xmissing",
      ),
    ).resolves.toBe(false);
  });
});

describe("fetchTransactionFromArchival", () => {
  afterEach(() => {
    resetArchivalEndpointCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads a pruned version from archival without credentials", async () => {
    const txn = {type: "user_transaction", version: "1", hash: "0xdead"};
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (host(url) === "archive.mainnet.aptoslabs.com") {
          expect(new Headers(init?.headers).get("Authorization")).toBeNull();
          expect(new URL(url).pathname).toBe("/v1/transactions/by_version/1");
          return jsonResponse(200, txn);
        }
        return jsonResponse(410, {
          archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
        });
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchTransactionFromArchival(
        "https://api.mainnet.aptoslabs.com/v1",
        "1",
        {Authorization: "Bearer secret"},
      ),
    ).resolves.toEqual(txn);
  });
});
