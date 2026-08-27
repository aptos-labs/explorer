import {afterEach, describe, expect, it, vi} from "vitest";
import {AptosClient} from "./legacyClient";

/**
 * Parse a fetched URL and return its hostname for exact-match dispatch.
 * Using `new URL().hostname === "..."` avoids the "Incomplete URL substring
 * sanitization" CodeQL pattern that `url.includes("archive.mainnet...")`
 * triggers — `includes` would also match attacker-controlled URLs like
 * `https://evil.example/?x=archive.mainnet.aptoslabs.com`.
 */
function host(url: string): string {
  return new URL(url).hostname;
}

describe("AptosClient archival 410 retry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retries pruned reads against the advertised archival endpoint", async () => {
    const txn = {type: "user_transaction", version: "1", hash: "0x1"};
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (host(url) === "archive.mainnet.aptoslabs.com") {
        return {
          ok: true,
          json: async () => txn,
        };
      }
      return {
        ok: false,
        status: 410,
        text: async () =>
          JSON.stringify({
            error_code: "version_pruned",
            archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
          }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AptosClient("https://api.mainnet.aptoslabs.com/v1", {
      HEADERS: {Authorization: "Bearer test"},
    });
    const result = await client.getTransactionByVersion(1n);
    expect(result).toEqual(txn);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const archivalUrl = new URL(String(fetchMock.mock.calls[1][0]));
    expect(archivalUrl.hostname).toBe("archive.mainnet.aptoslabs.com");
    expect(archivalUrl.pathname).toBe("/v1/transactions/by_version/1");
  });

  it("does not retry when no archival_endpoint is advertised", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 410,
      text: async () => JSON.stringify({error_code: "version_pruned"}),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new AptosClient("https://api.mainnet.aptoslabs.com/v1");
    await expect(client.getTransactionByVersion(1n)).rejects.toMatchObject({
      status: 410,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
