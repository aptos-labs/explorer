import {describe, expect, it} from "vitest";
import {decodeMultisigTransactionPayload} from "./decodeMultisigPayload";

// BCS of a MultiSigTransactionPayload wrapping
// 0x1::multisig_account::remove_owner(0x794b...21b)
// Taken from mainnet txn 154108372 (CreateTransactionEvent).
const REMOVE_OWNER_PAYLOAD =
  "0x000000000000000000000000000000000000000000000000000000000000000001106d756c74697369675f6163636f756e740c72656d6f76655f6f776e6572000120794b17ff4abc6e98dec576d0ac5d7bd0bd5fb92177f66f971b273b5292d7f21b";

// Covers FEAT-TXN-004 (multisig payload decoding)
describe("decodeMultisigTransactionPayload — FEAT-TXN-004", () => {
  it("decodes a MultiSigTransactionPayload into an entry function", () => {
    const decoded = decodeMultisigTransactionPayload(REMOVE_OWNER_PAYLOAD);
    expect(decoded).not.toBeNull();
    expect(decoded?.function).toBe("0x1::multisig_account::remove_owner");
    expect(decoded?.typeArguments).toEqual([]);
    expect(decoded?.arguments).toEqual([
      "0x794b17ff4abc6e98dec576d0ac5d7bd0bd5fb92177f66f971b273b5292d7f21b",
    ]);
  });

  it("returns null for empty / missing payloads", () => {
    expect(decodeMultisigTransactionPayload(undefined)).toBeNull();
    expect(decodeMultisigTransactionPayload(null)).toBeNull();
    expect(decodeMultisigTransactionPayload("")).toBeNull();
    expect(decodeMultisigTransactionPayload("0x")).toBeNull();
  });

  it("returns null for bytes that are not a valid payload", () => {
    expect(decodeMultisigTransactionPayload("0x1234")).toBeNull();
    expect(decodeMultisigTransactionPayload("not-hex")).toBeNull();
  });
});
