import {describe, expect, it} from "vitest";
import {
  type ValidatorData,
  buildValidatorsFromSources,
} from "./useGetValidators";
import type {Validator} from "./useGetValidatorSet";

// Covers FEAT-VALIDATORS-002 — All Nodes table data merge / fallback

const sampleActive: Validator[] = [
  {
    addr: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    config: {
      consensus_pubkey: "0x00",
      fullnode_addresses: "0x",
      network_addresses: "0x",
      validator_index: "0",
    },
    voting_power: "1000000",
  },
  {
    addr: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    config: {
      consensus_pubkey: "0x01",
      fullnode_addresses: "0x",
      network_addresses: "0x",
      validator_index: "1",
    },
    voting_power: "500000",
  },
];

describe("buildValidatorsFromSources", () => {
  it("returns empty when there are no active validators", () => {
    const raw: ValidatorData[] = [
      {
        owner_address:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        operator_address:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        voting_power: "0",
        governance_voting_record: "0 / 0",
        last_epoch: 1,
        last_epoch_performance: "10/10",
        liveness: 1,
        rewards_growth: 99,
        apt_rewards_distributed: 0,
      },
    ];
    expect(buildValidatorsFromSources([], raw)).toEqual([]);
  });

  it("uses on-chain ValidatorSet when stats JSON is empty", () => {
    const rows = buildValidatorsFromSources(sampleActive, []);
    const firstActive = sampleActive[0];
    expect(rows).toHaveLength(2);
    expect(rows[0]?.owner_address).toBe(firstActive?.addr);
    expect(rows[0]?.operator_address).toBe(firstActive?.addr);
    expect(rows[0]?.voting_power).toBe("1000000");
    expect(rows[0]?.rewards_growth).toBeUndefined();
    expect(rows[0]?.location_stats).toBeUndefined();
    expect(rows[1]?.voting_power).toBe("500000");
  });

  it("merges stats JSON with active set voting power when JSON is present", () => {
    const raw: ValidatorData[] = [
      {
        owner_address:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        operator_address:
          "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        voting_power: "0",
        governance_voting_record: "1 / 1",
        last_epoch: 10,
        last_epoch_performance: "100/100",
        liveness: 0.5,
        rewards_growth: 12.34,
        apt_rewards_distributed: 1,
      },
    ];
    const rows = buildValidatorsFromSources(sampleActive, raw);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.voting_power).toBe("1000000");
    expect(rows[0]?.rewards_growth).toBe(12.34);
    expect(rows[0]?.operator_address).toContain("cccccccc");
  });
});
