import {Hex} from "@aptos-labs/ts-sdk";

type MoveDecompilerWasmModule =
  typeof import("../wasm/move_decompiler_wasm.js");

let moveDecompilerModulePromise: Promise<MoveDecompilerWasmModule> | null =
  null;

type DecompilationCacheEntry = {
  decompiledSource?: string;
  disassembly?: string;
};

const MAX_DECOMPILATION_CACHE_SIZE = 30;
const decompilationCache = new Map<string, DecompilationCacheEntry>();

export type DecompilationView = "decompiled-source" | "bytecode-disassembly";

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

function getNormalizedBytecodeHex(bytecodeHex: string): string {
  return bytecodeHex.startsWith("0x")
    ? bytecodeHex.toLowerCase()
    : `0x${bytecodeHex.toLowerCase()}`;
}

async function loadMoveDecompilerWasm() {
  if (typeof window === "undefined") {
    throw new Error("Move decompiler is only available in the browser");
  }

  if (!moveDecompilerModulePromise) {
    moveDecompilerModulePromise = (async () => {
      try {
        const module = await import("../wasm/move_decompiler_wasm.js");
        await module.default();
        return module;
      } catch (error) {
        // Retry initialization on the next request if a transient load error occurs.
        moveDecompilerModulePromise = null;
        throw error;
      }
    })();
  }

  return moveDecompilerModulePromise;
}

function touchDecompilationCache(
  normalizedBytecodeHex: string,
  cacheEntry: DecompilationCacheEntry,
) {
  decompilationCache.set(normalizedBytecodeHex, cacheEntry);
  if (decompilationCache.size <= MAX_DECOMPILATION_CACHE_SIZE) {
    return;
  }

  const oldestKey = decompilationCache.keys().next().value;
  if (oldestKey) {
    decompilationCache.delete(oldestKey);
  }
}

export async function getDecompiledCodeView(
  bytecodeHex: string,
  view: DecompilationView,
): Promise<string> {
  const normalizedBytecodeHex = getNormalizedBytecodeHex(bytecodeHex);
  const cachedEntry = decompilationCache.get(normalizedBytecodeHex);
  if (cachedEntry) {
    if (view === "decompiled-source" && cachedEntry.decompiledSource) {
      return cachedEntry.decompiledSource;
    }
    if (view === "bytecode-disassembly" && cachedEntry.disassembly) {
      return cachedEntry.disassembly;
    }
  }

  const wasmModule = await loadMoveDecompilerWasm();
  const bytecodeBytes = bytecodeHexToBytes(bytecodeHex);

  wasmModule.verify_module(bytecodeBytes);

  const nextEntry: DecompilationCacheEntry = cachedEntry ?? {};
  if (view === "decompiled-source") {
    nextEntry.decompiledSource = wasmModule.decompile_module(bytecodeBytes);
    touchDecompilationCache(normalizedBytecodeHex, nextEntry);
    return nextEntry.decompiledSource;
  }

  nextEntry.disassembly = wasmModule.disassemble_module(bytecodeBytes);
  touchDecompilationCache(normalizedBytecodeHex, nextEntry);
  return nextEntry.disassembly;
}
