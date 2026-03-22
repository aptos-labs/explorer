import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {deriveProperties} from "./useGetFaProperties";

function mkResource(type: string, data: unknown): Types.MoveResource {
  return {type, data} as Types.MoveResource;
}

describe("deriveProperties", () => {
  it("returns null for undefined resources", () => {
    expect(deriveProperties(undefined)).toBeNull();
  });

  it("returns null for empty resources array", () => {
    expect(deriveProperties([])).toBeNull();
  });

  it("detects paired coin refs (all present)", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "APT"}),
      mkResource("0x1::coin::PairedFungibleAssetRefs", {
        mint_ref_opt: {vec: [{metadata: {inner: "0xa"}}]},
        burn_ref_opt: {vec: [{metadata: {inner: "0xa"}}]},
        transfer_ref_opt: {vec: [{metadata: {inner: "0xa"}}]},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result).toEqual({
      mintable: true,
      burnable: true,
      freezable: true,
      dispatchable: false,
      untransferable: false,
    });
  });

  it("detects paired coin refs with some absent", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "Foo"}),
      mkResource("0x1::coin::PairedFungibleAssetRefs", {
        mint_ref_opt: {vec: [{metadata: {inner: "0xa"}}]},
        burn_ref_opt: {vec: []},
        transfer_ref_opt: {vec: []},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result).toEqual({
      mintable: true,
      burnable: false,
      freezable: false,
      dispatchable: false,
      untransferable: false,
    });
  });

  it("detects Untransferable resource", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "NFT"}),
      mkResource("0x1::fungible_asset::Untransferable", {}),
      mkResource("0x1::coin::PairedFungibleAssetRefs", {
        mint_ref_opt: {vec: []},
        burn_ref_opt: {vec: []},
        transfer_ref_opt: {vec: []},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result?.untransferable).toBe(true);
  });

  it("detects DispatchFunctionStore resource", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "USDT"}),
      mkResource("0x1::fungible_asset::DispatchFunctionStore", {
        withdraw_function: {vec: []},
        deposit_function: {vec: []},
        derived_balance_function: {vec: []},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result?.dispatchable).toBe(true);
  });

  it("deep-scans custom resources for refs with Option<T> (vec) fields", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "Custom"}),
      mkResource("0xabc::my_module::ManagedFungibleAsset", {
        mint_ref: {vec: [{metadata: {inner: "0xabc"}}]},
        burn_ref: {vec: [{metadata: {inner: "0xabc"}}]},
        transfer_ref: {vec: []},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result).toEqual({
      mintable: true,
      burnable: true,
      freezable: false,
      dispatchable: false,
      untransferable: false,
    });
  });

  it("deep-scans custom resources for refs with direct object fields", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "Direct"}),
      mkResource("0xdef::token::Refs", {
        mint_ref: {metadata: {inner: "0xdef"}},
        burn_ref: {metadata: {inner: "0xdef"}},
        transfer_ref: {metadata: {inner: "0xdef"}},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result).toEqual({
      mintable: true,
      burnable: true,
      freezable: true,
      dispatchable: false,
      untransferable: false,
    });
  });

  it("skips framework resources during deep scan", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "Skip"}),
      mkResource("0x1::object::ObjectCore", {
        transfer_ref: {metadata: {inner: "0x1"}},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result?.mintable).toBe(false);
    expect(result?.burnable).toBe(false);
    expect(result?.freezable).toBe(false);
  });

  it("detects freeze_ref as freezable", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {}),
      mkResource("0xabc::module::Caps", {
        freeze_ref: {metadata: {inner: "0xabc"}},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result?.freezable).toBe(true);
  });

  it("handles all properties enabled together", () => {
    const resources = [
      mkResource("0x1::fungible_asset::Metadata", {name: "Full"}),
      mkResource("0x1::fungible_asset::Untransferable", {}),
      mkResource("0x1::fungible_asset::DispatchFunctionStore", {
        withdraw_function: {vec: []},
      }),
      mkResource("0xabc::m::Refs", {
        mint_ref: {metadata: {inner: "0xabc"}},
        burn_ref: {metadata: {inner: "0xabc"}},
        transfer_ref: {metadata: {inner: "0xabc"}},
      }),
    ];
    const result = deriveProperties(resources);
    expect(result).toEqual({
      mintable: true,
      burnable: true,
      freezable: true,
      dispatchable: true,
      untransferable: true,
    });
  });
});
