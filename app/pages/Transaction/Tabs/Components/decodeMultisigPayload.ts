import {
  Deserializer,
  EntryFunction,
  Hex,
  MultiSigTransactionPayload,
} from "@aptos-labs/ts-sdk";

/**
 * A multisig transaction payload decoded from its on-chain BCS bytes into a
 * human-readable entry function call.
 */
export type DecodedMultisigPayload = {
  /** Fully-qualified function id, e.g. `0x1::multisig_account::remove_owner`. */
  function: string;
  /** Type argument tags (e.g. `0x1::aptos_coin::AptosCoin`). */
  typeArguments: string[];
  /** Raw BCS bytes of each argument as a `0x`-prefixed hex string. */
  arguments: string[];
};

function entryFunctionToDecoded(ef: EntryFunction): DecodedMultisigPayload {
  const address = ef.module_name.address.toString();
  const moduleName = ef.module_name.name.identifier;
  const functionName = ef.function_name.identifier;
  return {
    function: `${address}::${moduleName}::${functionName}`,
    typeArguments: ef.type_args.map((tag) => tag.toString()),
    arguments: ef.args.map((arg) =>
      Hex.fromHexInput(arg.bcsToBytes()).toString(),
    ),
  };
}

/**
 * Decodes the BCS payload bytes stored by `0x1::multisig_account` (the
 * `transaction_payload` of execution events and the inner `payload` of a
 * `CreateTransaction` event) into a readable entry function.
 *
 * The payload is conventionally the BCS of a `MultiSigTransactionPayload`
 * (a variant-prefixed entry function); we fall back to a bare `EntryFunction`
 * for robustness. Returns `null` when the bytes are empty or cannot be decoded
 * (e.g. the multisig transaction was created with only a payload hash).
 */
export function decodeMultisigTransactionPayload(
  hexInput: string | undefined | null,
): DecodedMultisigPayload | null {
  if (!hexInput) return null;

  let bytes: Uint8Array;
  try {
    bytes = Hex.fromHexString(hexInput).toUint8Array();
  } catch {
    return null;
  }
  if (bytes.length === 0) return null;

  const attempts: Array<(d: Deserializer) => unknown> = [
    (d) => MultiSigTransactionPayload.deserialize(d).transaction_payload,
    (d) => EntryFunction.deserialize(d),
  ];

  for (const deserialize of attempts) {
    try {
      const deserializer = new Deserializer(bytes);
      const payload = deserialize(deserializer);
      // Require full consumption so we don't surface a partial mis-parse, and
      // only handle entry functions (scripts have no readable function id).
      if (deserializer.remaining() === 0 && payload instanceof EntryFunction) {
        return entryFunctionToDecoded(payload);
      }
    } catch {
      // Try the next strategy.
    }
  }

  return null;
}
