// Covers FEAT-VALIDATORS-002 — ValidatorSet resource parsing
import {describe, expect, it} from "vitest";
import {readValidatorSet} from "./useGetValidatorSet";

const active = {
  addr: "0x00000000000000000000000000000000000000000000000000000000000000aa",
  config: {
    consensus_pubkey: "0x00",
    fullnode_addresses: "0x",
    network_addresses: "0x",
    validator_index: "0",
  },
  voting_power: "1000000",
};

const inner = {
  active_validators: [active],
  total_voting_power: "1000000",
};

describe("FEAT-VALIDATORS-002 — readValidatorSet", () => {
  it("reads active validators from a REST {type, data} resource", () => {
    const result = readValidatorSet({
      type: "0x1::stake::ValidatorSet",
      data: inner,
    });
    expect(result.totalVotingPower).toBe("1000000");
    expect(result.numberOfActiveValidators).toBe(1);
    expect(result.activeValidators[0]?.voting_power).toBe("1000000");
    expect(result.activeValidators[0]?.addr).toBe(
      "0x00000000000000000000000000000000000000000000000000000000000000aa",
    );
  });

  it("reads active validators from the SDK-unwrapped ValidatorSet payload", () => {
    // Without this, /validators/all stays empty: useGetValidatorSet only
    // looked at resource.data, which is undefined on the SDK payload.
    const result = readValidatorSet(inner as never);
    expect(result.totalVotingPower).toBe("1000000");
    expect(result.numberOfActiveValidators).toBe(1);
    expect(result.activeValidators).toHaveLength(1);
  });

  it("returns empty state when the resource is missing", () => {
    expect(readValidatorSet(undefined)).toEqual({
      totalVotingPower: null,
      numberOfActiveValidators: null,
      activeValidators: [],
    });
  });
});
