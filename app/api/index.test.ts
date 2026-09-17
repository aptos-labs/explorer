import {describe, expect, it, vi} from "vitest";
import {getAddStakeFee} from "./index";
import type {AptosClient} from "./legacyClient";

describe("getAddStakeFee", () => {
  it("serializes fractional APT amounts to an integer octa argument", async () => {
    // Covers FEAT-VALDEL-003 — the add-stake fee view call accepts APT input.
    const view = vi.fn().mockResolvedValue(["0"]);
    const client = {view} as unknown as AptosClient;

    await getAddStakeFee(client, "0x1", "72.69899034");

    expect(view).toHaveBeenCalledWith({
      function: "0x1::delegation_pool::get_add_stake_fee",
      type_arguments: [],
      arguments: ["0x1", "7269899034"],
    });
  });
});
