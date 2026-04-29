import {afterEach, describe, expect, it, vi} from "vitest";
import {fetchNetworkStatus} from "./useGetNetworkStatus";

const mockLedger = {
  epoch: "100",
  block_height: "5000000",
  ledger_version: "10000000",
  chain_id: 1,
  git_hash: "9bd3d6d15afcf579d4745b761fe8913026354f9d",
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
        if (url.includes("0x1::gas_schedule::GasScheduleV2")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({data: {feature_version: "47", entries: []}}),
          });
        }
        if (url.includes("0x1::version::Version")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: {major: "4"}}),
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
        if (url.includes("0x1::features::Features")) {
          return Promise.resolve({
            ok: true,
            // 0x220082 → features 1, 5, 17, 23 enabled (matches Move test); flag 5 ⇒ bytecode v6+
            json: () => Promise.resolve({data: {features: "0x220082"}}),
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
    expect(result.gitHash).toBe("9bd3d6d15afcf579d4745b761fe8913026354f9d");
    expect(result.frameworkRelease).toBe("1.43");
    expect(result.gasFeatureVersion).toBe(47);
    expect(result.bytecodeFormatVersion).toBe(6);
    expect(result.protocolMajorVersion).toBe(4);
    expect(result.validatorCount).toBe(104);
    expect(result.enabledFeatures).toEqual([1, 5, 17, 23]);
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
    expect(result.frameworkRelease).toBeNull();
    expect(result.gasFeatureVersion).toBeNull();
    expect(result.bytecodeFormatVersion).toBeNull();
    expect(result.protocolMajorVersion).toBeNull();
    expect(result.validatorCount).toBeNull();
    expect(result.enabledFeatures).toBeNull();
    // The mock ledger always supplies a git_hash; gitHash should pass through.
    expect(result.gitHash).toBe("9bd3d6d15afcf579d4745b761fe8913026354f9d");
  });

  it("returns null gitHash when the ledger response omits it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                epoch: "1",
                block_height: "1",
                ledger_version: "1",
                chain_id: 1,
                // git_hash intentionally omitted
              }),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchNetworkStatus("devnet");
    expect(result.gitHash).toBeNull();
  });
});
