import {AccountAddress, Hex, Serializer} from "@aptos-labs/ts-sdk";
import {describe, expect, it} from "vitest";
import {decodeMoveArgument, decodeMoveArguments} from "./decodeMoveArgument";

function toHex(serialize: (s: Serializer) => void): string {
  const serializer = new Serializer();
  serialize(serializer);
  return Hex.fromHexInput(serializer.toUint8Array()).toString();
}

const ADDR =
  "0x794b17ff4abc6e98dec576d0ac5d7bd0bd5fb92177f66f971b273b5292d7f21b";

// Covers FEAT-TXN-011 / FEAT-TXN-004 (BCS argument decoding by Move type)
describe("decodeMoveArgument — FEAT-TXN-011", () => {
  it("decodes addresses", () => {
    const hex = toHex((s) => AccountAddress.from(ADDR).serialize(s));
    expect(decodeMoveArgument(hex, "address")).toEqual({
      kind: "address",
      value: ADDR,
    });
  });

  it("decodes unsigned integers (u8..u256)", () => {
    expect(
      decodeMoveArgument(
        toHex((s) => s.serializeU8(42)),
        "u8",
      ),
    ).toEqual({
      kind: "number",
      value: "42",
    });
    expect(
      decodeMoveArgument(
        toHex((s) => s.serializeU64(1000000)),
        "u64",
      ),
    ).toEqual({kind: "number", value: "1000000"});
    expect(
      decodeMoveArgument(
        toHex((s) => s.serializeU128(123456789012345678901234567890n)),
        "u128",
      ),
    ).toEqual({kind: "number", value: "123456789012345678901234567890"});
  });

  it("decodes booleans", () => {
    expect(
      decodeMoveArgument(
        toHex((s) => s.serializeBool(true)),
        "bool",
      ),
    ).toEqual({kind: "bool", value: true});
    expect(
      decodeMoveArgument(
        toHex((s) => s.serializeBool(false)),
        "bool",
      ),
    ).toEqual({kind: "bool", value: false});
  });

  it("decodes 0x1::string::String", () => {
    expect(
      decodeMoveArgument(
        toHex((s) => s.serializeStr("hello")),
        "0x1::string::String",
      ),
    ).toEqual({kind: "string", value: "hello"});
  });

  it("decodes vector<u8> as hex bytes", () => {
    const hex = toHex((s) => s.serializeBytes(new Uint8Array([1, 2, 255])));
    expect(decodeMoveArgument(hex, "vector<u8>")).toEqual({
      kind: "bytes",
      value: "0x0102ff",
    });
  });

  it("decodes vector<address>", () => {
    const hex = toHex((s) => {
      s.serializeU32AsUleb128(2);
      AccountAddress.from("0x1").serialize(s);
      AccountAddress.from(ADDR).serialize(s);
    });
    expect(decodeMoveArgument(hex, "vector<address>")).toEqual({
      kind: "vector",
      value: [
        {kind: "address", value: AccountAddress.from("0x1").toString()},
        {kind: "address", value: ADDR},
      ],
    });
  });

  it("decodes 0x1::object::Object<...> as an object address", () => {
    const hex = toHex((s) => AccountAddress.from(ADDR).serialize(s));
    expect(
      decodeMoveArgument(
        hex,
        "0x1::object::Object<0x1::fungible_asset::Metadata>",
      ),
    ).toEqual({kind: "object", value: ADDR});
  });

  it("decodes Option<u64> (some and none)", () => {
    const some = toHex((s) => {
      s.serializeU32AsUleb128(1);
      s.serializeU64(7);
    });
    expect(decodeMoveArgument(some, "0x1::option::Option<u64>")).toEqual({
      kind: "option",
      value: {kind: "number", value: "7"},
    });

    const none = toHex((s) => s.serializeU32AsUleb128(0));
    expect(decodeMoveArgument(none, "0x1::option::Option<u64>")).toEqual({
      kind: "option",
      value: null,
    });
  });

  it("returns null for unsupported struct types", () => {
    const hex = toHex((s) => s.serializeU64(1));
    expect(decodeMoveArgument(hex, "0x1::custom::Thing")).toBeNull();
  });

  it("returns null for invalid hex or leftover bytes", () => {
    expect(decodeMoveArgument("not-hex", "u64")).toBeNull();
    // 16 bytes for a u64 (8 expected) -> leftover -> null
    expect(
      decodeMoveArgument("0x01000000000000000100000000000000", "u64"),
    ).toBeNull();
  });

  it("decodeMoveArguments aligns positionally and tolerates missing types", () => {
    const addrHex = toHex((s) => AccountAddress.from(ADDR).serialize(s));
    const u64Hex = toHex((s) => s.serializeU64(5));
    const result = decodeMoveArguments(
      [addrHex, u64Hex],
      ["address"], // only one param type provided
    );
    expect(result[0]).toEqual({kind: "address", value: ADDR});
    expect(result[1]).toBeNull();
  });
});
