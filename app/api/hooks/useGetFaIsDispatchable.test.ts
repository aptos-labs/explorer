// Covers FEAT-FA-002 — FA dispatchable detection and function-info parsing
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {deriveDispatchInfo} from "./useGetFaIsDispatchable";

function mkResource(type: string, data: unknown = {}): Types.MoveResource {
  return {type, data} as Types.MoveResource;
}

const STORE_TYPE = "0x1::fungible_asset::DispatchFunctionStore";
const SUPPLY_TYPE = "0x1::fungible_asset::DeriveSupply";

describe("deriveDispatchInfo", () => {
  it("returns null when resources are undefined", () => {
    expect(deriveDispatchInfo(undefined)).toBeNull();
  });

  it("returns null when the DispatchFunctionStore resource is absent", () => {
    expect(
      deriveDispatchInfo([
        mkResource("0x1::fungible_asset::Metadata", {name: "X"}),
      ]),
    ).toBeNull();
  });

  it("returns an empty functions list when the store has no registered hooks", () => {
    const resources = [
      mkResource(STORE_TYPE, {
        withdraw_function: {vec: []},
        deposit_function: {vec: []},
        derived_balance_function: {vec: []},
      }),
    ];
    expect(deriveDispatchInfo(resources)).toEqual({
      isDispatchable: true,
      functions: [],
    });
  });

  it("parses every registered hook in DispatchFunctionStore", () => {
    const resources = [
      mkResource(STORE_TYPE, {
        withdraw_function: {
          vec: [
            {
              module_address: "0xabc",
              module_name: "issuer",
              function_name: "withdraw_hook",
            },
          ],
        },
        deposit_function: {
          vec: [
            {
              module_address: "0xabc",
              module_name: "issuer",
              function_name: "deposit_hook",
            },
          ],
        },
        derived_balance_function: {
          vec: [
            {
              module_address: "0xdef",
              module_name: "balance",
              function_name: "compute",
            },
          ],
        },
      }),
    ];
    const result = deriveDispatchInfo(resources);
    expect(result?.isDispatchable).toBe(true);
    expect(result?.functions).toEqual([
      {
        hook: "withdraw",
        moduleAddress: "0xabc",
        moduleName: "issuer",
        functionName: "withdraw_hook",
      },
      {
        hook: "deposit",
        moduleAddress: "0xabc",
        moduleName: "issuer",
        functionName: "deposit_hook",
      },
      {
        hook: "derived_balance",
        moduleAddress: "0xdef",
        moduleName: "balance",
        functionName: "compute",
      },
    ]);
  });

  it("also picks up derived_supply from the separate DeriveSupply resource", () => {
    const resources = [
      mkResource(STORE_TYPE, {
        withdraw_function: {vec: []},
        deposit_function: {vec: []},
        derived_balance_function: {vec: []},
      }),
      mkResource(SUPPLY_TYPE, {
        dispatch_function: {
          vec: [
            {
              module_address: "0xfeed",
              module_name: "issuer",
              function_name: "supply_hook",
            },
          ],
        },
      }),
    ];
    const result = deriveDispatchInfo(resources);
    expect(result?.functions).toEqual([
      {
        hook: "derived_supply",
        moduleAddress: "0xfeed",
        moduleName: "issuer",
        functionName: "supply_hook",
      },
    ]);
  });

  it("ignores malformed function info entries", () => {
    const resources = [
      mkResource(STORE_TYPE, {
        withdraw_function: {vec: [{module_address: "0xabc"}]},
        deposit_function: {vec: []},
        derived_balance_function: {vec: []},
      }),
    ];
    expect(deriveDispatchInfo(resources)).toEqual({
      isDispatchable: true,
      functions: [],
    });
  });

  it("treats the DeriveSupply resource alone as not-dispatchable when DispatchFunctionStore is absent", () => {
    const resources = [
      mkResource(SUPPLY_TYPE, {
        dispatch_function: {
          vec: [
            {
              module_address: "0xfeed",
              module_name: "issuer",
              function_name: "supply_hook",
            },
          ],
        },
      }),
    ];
    expect(deriveDispatchInfo(resources)).toBeNull();
  });
});
