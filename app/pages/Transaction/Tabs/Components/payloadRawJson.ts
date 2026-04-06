import type {Types} from "~/types/aptos";

const SCRIPT_BYTECODE_OMITTED =
  "[omitted — see Script section above for decompiler / bytecode]";

/**
 * Payload copy for the raw JSON card: avoids duplicating large script bytecode
 * when the tab already surfaces it via `ScriptBytecodeDecompiler`.
 */
export function payloadForRawJsonView(
  payload: Types.TransactionPayload,
): unknown {
  if (
    payload.type === "script_payload" &&
    "code" in payload &&
    payload.code &&
    typeof payload.code === "object" &&
    "bytecode" in payload.code &&
    typeof (payload.code as {bytecode?: unknown}).bytecode === "string"
  ) {
    const code = payload.code as {bytecode: string; abi?: unknown};
    const {bytecode: _b, ...restCode} = code;
    return {
      ...payload,
      code: {
        ...restCode,
        bytecode: SCRIPT_BYTECODE_OMITTED,
      },
    };
  }
  return payload;
}
