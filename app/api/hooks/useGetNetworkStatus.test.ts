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

// Covers FEAT-RELEASES-001 (fetchNetworkStatus: framework release, gas feature version, bytecode format)
describe("fetchNetworkStatus", () => {
  it("returns healthy status with gas schedule framework release and related fields", async () => {
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
    expect(result.fullnodeGitHash).toBe(
      "9bd3d6d15afcf579d4745b761fe8913026354f9d",
    );
    expect(result.validatorSetGitHash).toBeNull();
    expect(result.gitHash).toBe(result.fullnodeGitHash);
    expect(result.frameworkRelease).toBe("1.43");
    expect(result.gasFeatureVersion).toBe(47);
    expect(result.bytecodeFormatVersion).toBe(6);
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

  it("returns null frameworkRelease and validatorCount when optional resources fail", async () => {
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
    expect(result.validatorCount).toBeNull();
    expect(result.enabledFeatures).toBeNull();
    expect(result.fullnodeGitHash).toBe(mockLedger.git_hash);
    expect(result.validatorSetGitHash).toBeNull();
    expect(result.gitHash).toBe(result.fullnodeGitHash);
  });

  it("uses null frameworkRelease when gas feature_version is unmapped", async () => {
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
              Promise.resolve({
                data: {feature_version: "99999", entries: []},
              }),
          });
        }
        if (url.includes("0x1::stake::ValidatorSet")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: {active_validators: []}}),
          });
        }
        if (url.includes("0x1::features::Features")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: {features: "0x"}}),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchNetworkStatus("mainnet");
    expect(result.frameworkRelease).toBeNull();
    expect(result.gasFeatureVersion).toBe(99999);
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
    expect(result.fullnodeGitHash).toBeNull();
    expect(result.validatorSetGitHash).toBeNull();
    expect(result.gitHash).toBeNull();
  });

  it("sets validatorSetGitHash from probing advertised validator REST endpoints", async () => {
    const validatorHex =
      "016804023d76616c696461746f722e62626237366432642d303262352d346533652d626663332d3966313061326536393834392e6170746f732e6269736f6e2e72756e05241807203601215a079b0114a32104bd02149cf2258a206c8f8c79790e0684f4adfeae400800";
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
        if (url.includes("0x1::stake::ValidatorSet")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: {
                  active_validators: [
                    {config: {network_addresses: validatorHex}},
                  ],
                },
              }),
          });
        }
        if (url.includes("0x1::features::Features")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({data: {features: "0x220082"}}),
          });
        }
        if (url.includes("aptos.bison.run")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                git_hash:
                  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
              }),
          });
        }
        return Promise.resolve({ok: false, status: 404});
      }),
    );

    const result = await fetchNetworkStatus("mainnet");
    expect(result.validatorSetGitHash).toBe(
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    );
    expect(result.fullnodeGitHash).toBe(mockLedger.git_hash);
  });
});
