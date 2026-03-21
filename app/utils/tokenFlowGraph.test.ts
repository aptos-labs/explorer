import {describe, expect, it} from "vitest";
import {
  buildEdgesFromBatches,
  netByOwnerForAsset,
  pickCounterpartyAddress,
  signedActivityAmount,
  type FaActivityRow,
} from "./tokenFlowGraph";

function row(
  owner: string,
  type: string,
  amount: number,
  version = 1,
): FaActivityRow {
  return {
    transaction_version: version,
    owner_address: owner,
    type,
    amount,
    transaction_timestamp: "2025-01-01T00:00:00Z",
  };
}

describe("tokenFlowGraph", () => {
  it("computes signed amounts for FA deposit and withdraw", () => {
    expect(
      signedActivityAmount(row("0x2", "0x1::fungible_asset::Deposit", 100)),
    ).toBe(BigInt(100));
    expect(
      signedActivityAmount(row("0x2", "0x1::fungible_asset::Withdraw", 100)),
    ).toBe(BigInt(-100));
  });

  it("pairs outbound transfer as center withdraw and counterparty deposit", () => {
    const a =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const b =
      "0x00000000000000000000000000000000000000000000000000000000000000ab";
    const rows: FaActivityRow[] = [
      row(a, "0x1::fungible_asset::Withdraw", 50),
      row(b, "0x1::fungible_asset::Deposit", 50),
    ];
    const net = netByOwnerForAsset(rows);
    expect(pickCounterpartyAddress(a, net)).toBe(b);

    const batches = new Map<number, FaActivityRow[]>([[123, rows]]);
    const edges = buildEdgesFromBatches({
      center: a,
      direction: "outbound",
      batches,
    });
    expect(edges).toHaveLength(1);
    expect(edges[0]?.source).toBe(a);
    expect(edges[0]?.target).toBe(b);
    expect(edges[0]?.version).toBe(123);
  });

  it("pairs inbound transfer as counterparty withdraw and center deposit", () => {
    const a =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const b =
      "0x00000000000000000000000000000000000000000000000000000000000000ab";
    const rows: FaActivityRow[] = [
      row(b, "0x1::fungible_asset::Withdraw", 10),
      row(a, "0x1::fungible_asset::Deposit", 10),
    ];
    const batches = new Map<number, FaActivityRow[]>([[9, rows]]);
    const edges = buildEdgesFromBatches({
      center: a,
      direction: "inbound",
      batches,
    });
    expect(edges).toHaveLength(1);
    expect(edges[0]?.source).toBe(b);
    expect(edges[0]?.target).toBe(a);
  });
});
