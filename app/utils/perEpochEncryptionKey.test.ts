import {describe, expect, it} from "vitest";
import {
  parsePerEpochEncryptionKeyData,
  PER_EPOCH_ENCRYPTION_KEY_RESOURCE,
} from "./perEpochEncryptionKey";

describe("PerEpochEncryptionKey parsing", () => {
  it("recognizes the framework resource type", () => {
    expect(PER_EPOCH_ENCRYPTION_KEY_RESOURCE).toBe(
      "0x1::decryption::PerEpochEncryptionKey",
    );
  });

  it("parses epoch and Some(encryption_key) hex", () => {
    const parsed = parsePerEpochEncryptionKeyData({
      epoch: "33105",
      encryption_key: {
        vec: [
          "0x60a63c08ed80495373d2874f1443d4bcd7f75d8698ca709fbc21410441b7af38",
        ],
      },
    });
    expect(parsed).toEqual({
      epoch: "33105",
      encryptionKeyHex:
        "0x60a63c08ed80495373d2874f1443d4bcd7f75d8698ca709fbc21410441b7af38",
    });
  });

  it("parses None encryption_key (empty vec)", () => {
    const parsed = parsePerEpochEncryptionKeyData({
      epoch: "0",
      encryption_key: {vec: []},
    });
    expect(parsed).toEqual({
      epoch: "0",
      encryptionKeyHex: null,
    });
  });

  it("parses vector<u8> as a byte array", () => {
    const parsed = parsePerEpochEncryptionKeyData({
      epoch: "1",
      encryption_key: {vec: [[1, 2, 3]]},
    });
    expect(parsed?.encryptionKeyHex).toBe("0x010203");
  });

  it("returns null for invalid shapes", () => {
    expect(parsePerEpochEncryptionKeyData(null)).toBeNull();
    expect(parsePerEpochEncryptionKeyData({epoch: "x"})).toBeNull();
  });

  it("treats a missing encryption_key field as None", () => {
    expect(parsePerEpochEncryptionKeyData({epoch: "1"})).toEqual({
      epoch: "1",
      encryptionKeyHex: null,
    });
  });
});
