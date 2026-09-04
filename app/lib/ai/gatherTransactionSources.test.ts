import {describe, expect, it, vi} from "vitest";
import type {Types} from "~/types/aptos";
import {ResponseErrorType} from "../../api/client";
import {gatherTransactionSources} from "./gatherTransactionSources";

function entryTxn(functionId: string): Types.Transaction {
  return {
    type: "user_transaction",
    version: "10",
    payload: {
      type: "entry_function_payload",
      function: functionId,
      type_arguments: [],
      arguments: [],
    },
  } as unknown as Types.Transaction;
}

describe("gatherTransactionSources", () => {
  it("prefers published PackageRegistry source over decompilation", async () => {
    // Covers FEAT-TXN-016
    const decompileModule = vi.fn();
    const sources = await gatherTransactionSources(
      entryTxn("0x1::coin::transfer"),
      {} as never,
      {
        getAccountResource: async () =>
          ({
            type: "0x1::code::PackageRegistry",
            data: {
              packages: [
                {
                  name: "AptosFramework",
                  modules: [
                    {name: "coin", source: "module 0x1::coin {}"},
                    {name: "other", source: "module 0x1::other {}"},
                  ],
                  upgrade_policy: {policy: 2},
                  upgrade_number: "1",
                  source_digest: "d",
                  manifest: "",
                },
              ],
            },
          }) as Types.MoveResource,
        decodePublishedSource: (raw) => raw,
        decompileModule,
      },
    );

    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({
      kind: "module",
      origin: "published",
      code: "module 0x1::coin {}",
    });
    expect(decompileModule).not.toHaveBeenCalled();
  });

  it("decompiles module bytecode when published source is missing", async () => {
    const sources = await gatherTransactionSources(
      entryTxn("0x1::coin::transfer"),
      {} as never,
      {
        getAccountResource: async () => {
          throw {type: ResponseErrorType.NOT_FOUND};
        },
        getAccountModule: async () =>
          ({
            bytecode: "0xaabb",
            abi: {name: "coin"},
          }) as Types.MoveModuleBytecode,
        decompileModule: async () => "decompiled module coin",
      },
    );

    expect(sources[0]).toMatchObject({
      kind: "module",
      origin: "decompiled",
      code: "decompiled module coin",
    });
  });

  it("decompiles script bytecode when present", async () => {
    const txn = {
      type: "user_transaction",
      version: "3",
      payload: {
        type: "script_payload",
        code: {bytecode: "0xscript"},
        type_arguments: [],
        arguments: [],
      },
    } as unknown as Types.Transaction;

    const sources = await gatherTransactionSources(txn, {} as never, {
      decompileScript: async (hex) => `script from ${hex}`,
    });

    expect(sources).toEqual([
      expect.objectContaining({
        kind: "script",
        origin: "decompiled",
        code: "script from 0xscript",
      }),
    ]);
  });
});
