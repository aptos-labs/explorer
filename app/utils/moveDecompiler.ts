import {Hex} from "@aptos-labs/ts-sdk";

type MoveDecompilerWasmModule =
  typeof import("../wasm/move_decompiler_wasm.js");

let moveDecompilerModulePromise: Promise<MoveDecompilerWasmModule> | null =
  null;

export type DecompilationResult = {
  decompiledSource: string;
  disassembly: string;
};

export function bytecodeHexToBytes(bytecodeHex: string): Uint8Array {
  if (!bytecodeHex) {
    throw new Error("Bytecode is empty");
  }

  const normalizedBytecode = bytecodeHex.startsWith("0x")
    ? bytecodeHex
    : `0x${bytecodeHex}`;

  try {
    return Hex.fromHexString(normalizedBytecode).toUint8Array();
  } catch {
    throw new Error("Invalid bytecode hex");
  }
}

async function loadMoveDecompilerWasm() {
  if (typeof window === "undefined") {
    throw new Error("Move decompiler is only available in the browser");
  }

  if (!moveDecompilerModulePromise) {
    moveDecompilerModulePromise = import(
      "../wasm/move_decompiler_wasm.js"
    ).then(async (module) => {
      await module.default();
      return module;
    });
  }

  return moveDecompilerModulePromise;
}

export async function decompileModuleBytecode(
  bytecodeHex: string,
): Promise<DecompilationResult> {
  const wasmModule = await loadMoveDecompilerWasm();
  const bytecodeBytes = bytecodeHexToBytes(bytecodeHex);

  wasmModule.verify_module(bytecodeBytes);

  return {
    decompiledSource: wasmModule.decompile_module(bytecodeBytes),
    disassembly: wasmModule.disassemble_module(bytecodeBytes),
  };
}
