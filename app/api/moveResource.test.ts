// Covers FEAT-VALIDATORS-002 / FEAT-VALDEL-001 — SDK getAccountResource unwrap
import {describe, expect, it} from "vitest";
import {moveResourceData, toMoveResource} from "./moveResource";

const VALIDATOR_SET_TYPE = "0x1::stake::ValidatorSet";
const STAKE_POOL_TYPE = "0x1::stake::StakePool";

const validatorSetInner = {
  active_validators: [
    {
      addr: "0x1",
      config: {
        consensus_pubkey: "0x00",
        fullnode_addresses: "0x",
        network_addresses: "0x",
        validator_index: "0",
      },
      voting_power: "1000",
    },
  ],
  total_voting_power: "1000",
};

describe("FEAT-VALIDATORS-002 — toMoveResource", () => {
  it("wraps the SDK inner payload into the REST {type, data} envelope", () => {
    expect(toMoveResource(VALIDATOR_SET_TYPE, validatorSetInner)).toEqual({
      type: VALIDATOR_SET_TYPE,
      data: validatorSetInner,
    });
  });

  it("does not double-wrap an already REST-shaped resource", () => {
    const wrapped = {
      type: STAKE_POOL_TYPE,
      data: {locked_until_secs: "1", operator_address: "0x1"},
    };
    expect(toMoveResource(STAKE_POOL_TYPE, wrapped)).toEqual(wrapped);
  });
});

describe("FEAT-VALIDATORS-002 — moveResourceData", () => {
  it("returns .data from a REST-shaped resource", () => {
    expect(
      moveResourceData({
        type: VALIDATOR_SET_TYPE,
        data: validatorSetInner,
      }),
    ).toEqual(validatorSetInner);
  });

  it("returns the SDK-unwrapped payload as-is", () => {
    expect(moveResourceData(validatorSetInner)).toEqual(validatorSetInner);
  });

  it("returns undefined for nullish input", () => {
    expect(moveResourceData(undefined)).toBeUndefined();
    expect(moveResourceData(null)).toBeUndefined();
  });
});
