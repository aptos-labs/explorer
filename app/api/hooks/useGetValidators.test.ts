import {describe, expect, it} from "vitest";
import {
  type ValidatorData,
  buildValidatorsFromSources,
  isOperatorAddressMissing,
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

  it("uses operator map for chain-only rows when provided", () => {
    const poolAddr =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const operatorAddr =
      "0x1111111111111111111111111111111111111111111111111111111111111111";
    const rows = buildValidatorsFromSources(sampleActive, [], {
      [poolAddr]: operatorAddr,
    });
    expect(rows[0]?.owner_address).toBe(poolAddr);
    expect(rows[0]?.operator_address).toBe(operatorAddr);
    expect(rows[1]?.operator_address).toBe(sampleActive[1]?.addr);
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

  it("patches missing operator_address on stats JSON rows from on-chain map", () => {
    const poolA =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const poolB =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const operatorForA =
      "0x1111111111111111111111111111111111111111111111111111111111111111";
    const presentOperatorForB =
      "0x2222222222222222222222222222222222222222222222222222222222222222";
    const raw: ValidatorData[] = [
      {
        owner_address: poolA,
        // Stats JSON shipped an empty operator_address for this pool.
        operator_address: "",
        voting_power: "0",
        governance_voting_record: "",
        last_epoch: 0,
        last_epoch_performance: "",
        liveness: 0,
        rewards_growth: 0,
        apt_rewards_distributed: 0,
      },
      {
        owner_address: poolB,
        // This row already has a valid operator address and must not change.
        operator_address: presentOperatorForB,
        voting_power: "0",
        governance_voting_record: "",
        last_epoch: 0,
        last_epoch_performance: "",
        liveness: 0,
        rewards_growth: 0,
        apt_rewards_distributed: 0,
      },
    ];
    const rows = buildValidatorsFromSources(sampleActive, raw, {
      [poolA]: operatorForA,
      [poolB]: operatorForA, // should be ignored — row B already has one.
    });
    expect(rows[0]?.operator_address).toBe(operatorForA);
    expect(rows[1]?.operator_address).toBe(presentOperatorForB);
  });

  it("treats the zero address as a missing operator_address", () => {
    const poolA =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const operatorForA =
      "0x3333333333333333333333333333333333333333333333333333333333333333";
    const raw: ValidatorData[] = [
      {
        owner_address: poolA,
        operator_address:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        voting_power: "0",
        governance_voting_record: "",
        last_epoch: 0,
        last_epoch_performance: "",
        liveness: 0,
        rewards_growth: 0,
        apt_rewards_distributed: 0,
      },
    ];
    const rows = buildValidatorsFromSources(sampleActive, raw, {
      [poolA]: operatorForA,
    });
    expect(rows[0]?.operator_address).toBe(operatorForA);
  });

  it("keeps the existing operator_address when no patch is available", () => {
    const poolA =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const raw: ValidatorData[] = [
      {
        owner_address: poolA,
        operator_address: "",
        voting_power: "0",
        governance_voting_record: "",
        last_epoch: 0,
        last_epoch_performance: "",
        liveness: 0,
        rewards_growth: 0,
        apt_rewards_distributed: 0,
      },
    ];
    const rows = buildValidatorsFromSources(sampleActive, raw, {});
    expect(rows[0]?.operator_address).toBe("");
  });
});

describe("isOperatorAddressMissing", () => {
  it("treats null/undefined/empty/whitespace as missing", () => {
    expect(isOperatorAddressMissing(null)).toBe(true);
    expect(isOperatorAddressMissing(undefined)).toBe(true);
    expect(isOperatorAddressMissing("")).toBe(true);
    expect(isOperatorAddressMissing("   ")).toBe(true);
  });

  it("treats non-string values as missing", () => {
    expect(isOperatorAddressMissing(0)).toBe(true);
    expect(isOperatorAddressMissing(false)).toBe(true);
    expect(isOperatorAddressMissing({})).toBe(true);
  });

  it("treats unstandardizable addresses as missing", () => {
    expect(isOperatorAddressMissing("nope")).toBe(true);
    expect(isOperatorAddressMissing("0xZZZ")).toBe(true);
  });

  it("treats the zero address as missing", () => {
    expect(isOperatorAddressMissing("0x0")).toBe(true);
    expect(
      isOperatorAddressMissing(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ),
    ).toBe(true);
  });

  it("treats a real address as present", () => {
    expect(
      isOperatorAddressMissing(
        "0x1111111111111111111111111111111111111111111111111111111111111111",
      ),
    ).toBe(false);
    // Short-form addresses are accepted because tryStandardizeAddress expands
    // them to their canonical 32-byte form.
    expect(isOperatorAddressMissing("0x1")).toBe(false);
  });
});
