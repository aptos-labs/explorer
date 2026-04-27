import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchNetworkStatus} from "./useGetNetworkStatus";

const mockLedger = {
  epoch: "100",
  block_height: "5000000",
  ledger_version: "10000000",
  chain_id: 1,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchNetworkStatus", () => {
  it("returns healthy status with all fields populated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLedger),
          });
        }
        if (url.includes("0x1::version::Version")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: {major: "6"}}),
          });
        }
        if (url.includes("0x1::stake::ValidatorSet")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: {active_validators: new Array(104).fill({})},
              }),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchNetworkStatus("mainnet");

    expect(result.healthy).toBe(true);
    expect(result.epoch).toBe("100");
    expect(result.blockHeight).toBe("5000000");
    expect(result.ledgerVersion).toBe("10000000");
    expect(result.chainId).toBe("1");
    expect(result.frameworkVersion).toBe(6);
    expect(result.validatorCount).toBe(104);
  });

  it("throws when fullnode is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/")) {
          return Promise.resolve({ok: false, status: 503});
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    await expect(fetchNetworkStatus("mainnet")).rejects.toThrow(
      "Fullnode returned 503",
    );
  });

  it("returns null frameworkVersion and validatorCount when optional resources fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLedger),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchNetworkStatus("devnet");
    expect(result.healthy).toBe(true);
    expect(result.frameworkVersion).toBeNull();
    expect(result.validatorCount).toBeNull();
  });
});
