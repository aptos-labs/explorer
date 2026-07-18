// @vitest-environment jsdom
import {Hex} from "@aptos-labs/ts-sdk";
import {renderHook} from "@testing-library/react";
import pako from "pako";
import {afterEach, describe, expect, it, vi} from "vitest";

const packagesMock = vi.fn(
  (..._args: unknown[]) => ({packages: []}) as unknown,
);
vi.mock("../../../../api/hooks/useGetAccountResource", () => ({
  useGetAccountPackages: (...args: unknown[]) => packagesMock(...args),
}));

import {useEntryFunctionArgNames} from "./useEntryFunctionArgNames";

/** Move source is stored gzip-compressed hex (see `transformCode`). */
function gzipHex(source: string): string {
  return Hex.fromHexInput(pako.gzip(source)).toString();
}

function withPackages(moduleName: string, source: string) {
  packagesMock.mockReturnValue({
    packages: [
      {
        name: "TestPackage",
        modules: [{name: moduleName, source: gzipHex(source)}],
      },
    ],
  } as unknown);
}

const removeOwner = {
  name: "remove_owner",
  visibility: "public",
  is_entry: true,
  is_view: false,
  generic_type_params: [],
  params: ["&signer", "address"],
  return: [],
} as unknown as never;

// Covers FEAT-TXN-011 (entry function argument name resolution)
describe("useEntryFunctionArgNames — FEAT-TXN-011", () => {
  afterEach(() => {
    vi.clearAllMocks();
    packagesMock.mockReturnValue({packages: []} as unknown);
  });

  it("resolves argument names from Move source, dropping signer slots", () => {
    withPackages(
      "multisig_account",
      "public entry fun remove_owner(owner: &signer, owner_to_remove: address) { }",
    );

    const {result} = renderHook(() =>
      useEntryFunctionArgNames({
        address: "0x1",
        moduleName: "multisig_account",
        functionName: "remove_owner",
        argCount: 1,
        typeArgCount: 0,
        moveFunction: removeOwner,
      }),
    );

    expect(result.current.functionArgNames).toEqual(["owner_to_remove"]);
    expect(result.current.typeArgNames).toBeNull();
  });

  it("resolves type-parameter names from Move source", () => {
    withPackages(
      "coin",
      "public entry fun transfer<CoinType>(sender: &signer, amount: u64) { }",
    );

    const {result} = renderHook(() =>
      useEntryFunctionArgNames({
        address: "0x1",
        moduleName: "coin",
        functionName: "transfer",
        argCount: 1,
        typeArgCount: 1,
        moveFunction: {
          name: "transfer",
          visibility: "public",
          is_entry: true,
          is_view: false,
          generic_type_params: [{constraints: []}],
          params: ["&signer", "u64"],
          return: [],
        } as unknown as never,
      }),
    );

    expect(result.current.typeArgNames).toEqual(["CoinType"]);
    expect(result.current.functionArgNames).toEqual(["amount"]);
  });

  it("returns null names when no Move source is available", () => {
    const {result} = renderHook(() =>
      useEntryFunctionArgNames({
        address: "0x1",
        moduleName: "multisig_account",
        functionName: "remove_owner",
        argCount: 1,
        typeArgCount: 0,
        moveFunction: removeOwner,
      }),
    );

    expect(result.current.functionArgNames).toBeNull();
    expect(result.current.typeArgNames).toBeNull();
  });
});
