import {describe, expect, it} from "vitest";
import {
  parsePerBlockDecryptionKeyData,
  PER_BLOCK_DECRYPTION_KEY_RESOURCE,
} from "./perBlockDecryptionKey";

describe("PerBlockDecryptionKey parsing", () => {
  it("recognizes the framework resource type", () => {
    expect(PER_BLOCK_DECRYPTION_KEY_RESOURCE).toBe(
      "0x1::decryption::PerBlockDecryptionKey",
    );
  });

  it("parses epoch, round, and Some(decryption_key)", () => {
    const parsed = parsePerBlockDecryptionKeyData({
      epoch: "33105",
      round: "42",
      decryption_key: {vec: ["0xabcd"]},
    });
    expect(parsed).toEqual({
      epoch: "33105",
      round: "42",
      decryptionKeyHex: "0xabcd",
    });
  });

  it("parses None decryption_key", () => {
    expect(
      parsePerBlockDecryptionKeyData({
        epoch: "0",
        round: "0",
        decryption_key: {vec: []},
      }),
    ).toEqual({
      epoch: "0",
      round: "0",
      decryptionKeyHex: null,
    });
  });

  it("returns null for invalid shapes", () => {
    expect(parsePerBlockDecryptionKeyData(null)).toBeNull();
    expect(parsePerBlockDecryptionKeyData({epoch: "1", round: "x"})).toBeNull();
  });
});
