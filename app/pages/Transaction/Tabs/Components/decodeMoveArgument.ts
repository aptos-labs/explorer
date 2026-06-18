import {
  AccountAddress,
  Deserializer,
  Hex,
  parseTypeTag,
  type TypeTag,
  TypeTagAddress,
  TypeTagBool,
  TypeTagReference,
  TypeTagStruct,
  TypeTagU8,
  TypeTagU16,
  TypeTagU32,
  TypeTagU64,
  TypeTagU128,
  TypeTagU256,
  TypeTagVector,
} from "@aptos-labs/ts-sdk";

/**
 * A single entry-function argument decoded from its raw BCS bytes using the
 * Move parameter type from the module ABI.
 */
export type DecodedMoveValue =
  | {kind: "address"; value: string}
  | {kind: "object"; value: string}
  | {kind: "string"; value: string}
  | {kind: "bool"; value: boolean}
  | {kind: "number"; value: string}
  | {kind: "bytes"; value: string}
  | {kind: "vector"; value: DecodedMoveValue[]}
  | {kind: "option"; value: DecodedMoveValue | null};

/** Strips `&`/`&mut` reference wrappers (entry args are never references, but be safe). */
function unwrapReference(tag: TypeTag): TypeTag {
  return tag instanceof TypeTagReference ? tag.value : tag;
}

function readValue(
  deserializer: Deserializer,
  rawTag: TypeTag,
): DecodedMoveValue {
  const tag = unwrapReference(rawTag);

  if (tag instanceof TypeTagBool) {
    return {kind: "bool", value: deserializer.deserializeBool()};
  }
  if (tag instanceof TypeTagU8) {
    return {kind: "number", value: String(deserializer.deserializeU8())};
  }
  if (tag instanceof TypeTagU16) {
    return {kind: "number", value: String(deserializer.deserializeU16())};
  }
  if (tag instanceof TypeTagU32) {
    return {kind: "number", value: String(deserializer.deserializeU32())};
  }
  if (tag instanceof TypeTagU64) {
    return {kind: "number", value: deserializer.deserializeU64().toString()};
  }
  if (tag instanceof TypeTagU128) {
    return {kind: "number", value: deserializer.deserializeU128().toString()};
  }
  if (tag instanceof TypeTagU256) {
    return {kind: "number", value: deserializer.deserializeU256().toString()};
  }
  if (tag instanceof TypeTagAddress) {
    return {
      kind: "address",
      value: AccountAddress.deserialize(deserializer).toString(),
    };
  }
  if (tag instanceof TypeTagVector) {
    const inner = unwrapReference(tag.value);
    // vector<u8> is conventionally raw bytes; show as hex.
    if (inner instanceof TypeTagU8) {
      const bytes = deserializer.deserializeBytes();
      return {kind: "bytes", value: Hex.fromHexInput(bytes).toString()};
    }
    const length = deserializer.deserializeUleb128AsU32();
    const items: DecodedMoveValue[] = [];
    for (let i = 0; i < length; i++) {
      items.push(readValue(deserializer, inner));
    }
    return {kind: "vector", value: items};
  }
  if (tag instanceof TypeTagStruct) {
    const st = tag.value;
    const name = `${st.address.toString()}::${st.moduleName.identifier}::${st.name.identifier}`;
    if (name === "0x1::string::String") {
      return {kind: "string", value: deserializer.deserializeStr()};
    }
    if (name === "0x1::object::Object") {
      // Object<T> wraps a single address.
      return {
        kind: "object",
        value: AccountAddress.deserialize(deserializer).toString(),
      };
    }
    if (name === "0x1::option::Option") {
      // Option<T> is BCS-encoded as a vector<T> holding zero or one element.
      const inner = st.typeArgs[0];
      const length = deserializer.deserializeUleb128AsU32();
      if (length === 0 || inner === undefined) {
        return {kind: "option", value: null};
      }
      return {kind: "option", value: readValue(deserializer, inner)};
    }
    throw new Error(`Unsupported struct type: ${name}`);
  }

  throw new Error("Unsupported Move type");
}

/**
 * Decodes a single entry-function argument's raw BCS bytes into a typed value
 * using its Move parameter type string (e.g. `address`, `u64`,
 * `0x1::string::String`, `vector<address>`, `0x1::object::Object<...>`).
 *
 * Returns `null` when the type cannot be parsed, is unsupported (e.g. a custom
 * struct or generic), or the bytes do not fully decode — callers should fall
 * back to showing the raw bytes in that case.
 */
export function decodeMoveArgument(
  hexInput: string,
  typeStr: string,
): DecodedMoveValue | null {
  let tag: TypeTag;
  try {
    tag = parseTypeTag(typeStr, {allowGenerics: true});
  } catch {
    return null;
  }

  let bytes: Uint8Array;
  try {
    bytes = Hex.fromHexString(hexInput).toUint8Array();
  } catch {
    return null;
  }

  try {
    const deserializer = new Deserializer(bytes);
    const value = readValue(deserializer, tag);
    // Require full consumption so we never surface a partial mis-parse.
    if (deserializer.remaining() !== 0) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

/**
 * Decodes a positional list of entry-function arguments. `paramTypes` should be
 * the ABI parameter types with leading `signer`/`&signer` already removed so
 * each entry aligns with `args[i]`. Entries are `null` where decoding failed or
 * no matching parameter type is available.
 */
export function decodeMoveArguments(
  args: string[],
  paramTypes: string[] | undefined,
): Array<DecodedMoveValue | null> {
  return args.map((hex, i) => {
    const typeStr = paramTypes?.[i];
    if (typeStr === undefined) return null;
    return decodeMoveArgument(hex, typeStr);
  });
}
