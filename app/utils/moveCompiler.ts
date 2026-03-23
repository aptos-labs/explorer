/**
 * Dynamic loader for the Move compiler WASM module.
 *
 * Built from https://github.com/gregnazario/aptos-core/pull/4
 * (branch: wasm-eval-aptos-move-cli, crate: aptos-move/move-compiler-wasm).
 *
 * The compiler is loaded lazily — it is only fetched when the user
 * explicitly triggers bytecode verification that requires recompilation.
 */

type MoveCompilerWasmModule = typeof import("../wasm/move_compiler_wasm.js");

let compilerModulePromise: Promise<MoveCompilerWasmModule> | null = null;

export type CompileResult = {
  success: boolean;
  bytecode: Uint8Array;
  errors: string[];
  warnings: string[];
};

export type NamedAddressMap = Record<string, string>;

export function isCompilerAvailable(): boolean {
  return true;
}

/**
 * Dynamically load the Move compiler WASM module.
 * Browser-only – throws if `window` is undefined.
 */
export async function loadMoveCompilerWasm(): Promise<MoveCompilerWasmModule> {
  if (typeof window === "undefined") {
    throw new Error("Move compiler is only available in the browser");
  }

  if (!compilerModulePromise) {
    compilerModulePromise = (async () => {
      try {
        const module = await import("../wasm/move_compiler_wasm.js");
        await module.default();
        return module;
      } catch (error) {
        compilerModulePromise = null;
        throw error;
      }
    })();
  }

  return compilerModulePromise;
}

/**
 * Compile a single Move module from source code using the compiler WASM.
 *
 * @param source   – Move source code
 * @param address  – Module address (e.g. "0x1")
 * @param moduleName – Module name (e.g. "coin")
 */
export async function compileMoveModule(
  source: string,
  address: string,
  moduleName: string,
): Promise<CompileResult> {
  const compiler = await loadMoveCompilerWasm();
  const result = compiler.compile_module(source, address, moduleName);

  try {
    return {
      success: result.success,
      bytecode: result.bytecode,
      errors: JSON.parse(result.errors || "[]"),
      warnings: JSON.parse(result.warnings || "[]"),
    };
  } finally {
    result.free();
  }
}
