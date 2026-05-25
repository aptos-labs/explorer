// Covers FEAT-FA-002 — FA dispatchable detection
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {isDispatchableFromResources} from "./useGetFaIsDispatchable";

function mkResource(type: string, data: unknown = {}): Types.MoveResource {
  return {type, data} as Types.MoveResource;
}

describe("isDispatchableFromResources", () => {
  it("returns null when resources are undefined", () => {
    expect(isDispatchableFromResources(undefined)).toBeNull();
  });

  it("returns false for an empty resource list", () => {
    expect(isDispatchableFromResources([])).toBe(false);
  });

  it("returns false when DispatchFunctionStore is absent", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "X"}),
      mkResource("0x1::fungible_asset::Supply", {current: "0"}),
    ];
    expect(isDispatchableFromResources(resources)).toBe(false);
  });

  it("returns true when DispatchFunctionStore is present", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "X"}),
      mkResource("0x1::fungible_asset::DispatchFunctionStore", {
        withdraw_function: {vec: []},
        deposit_function: {vec: []},
        derived_balance_function: {vec: []},
      }),
    ];
    expect(isDispatchableFromResources(resources)).toBe(true);
  });
});
