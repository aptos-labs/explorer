/**
 * Dynamic loader for the Move compiler WASM module.
 *
 * The compiler WASM is being developed in
 * https://github.com/gregnazario/aptos-core/pull/4  (branch: wasm-eval-aptos-move-cli).
 *
 * Once the WASM binary is available it should be placed in `app/wasm/` alongside
 * the existing decompiler WASM and this loader updated to reference it.
 *
 * The compiler is intentionally loaded lazily – it is only fetched when the user
 * explicitly requests bytecode verification that requires recompilation.
 */

export type CompileResult = {
  success: boolean;
  bytecode?: Uint8Array;
  errors?: string[];
};

export type NamedAddressMap = Record<string, string>;

let compilerModulePromise: Promise<MoveCompilerWasmModule | null> | null = null;

type MoveCompilerWasmModule = {
  compile_move_source: (
    source: string,
    namedAddresses: string,
  ) => CompileResult;
};

export function isCompilerAvailable(): boolean {
  return false;
}

/**
 * Attempt to load the Move compiler WASM module.
 * Returns `null` if the module is not yet available (i.e. the WASM binary
 * has not been added to the project).
 */
export async function loadMoveCompilerWasm(): Promise<MoveCompilerWasmModule | null> {
  if (typeof window === "undefined") return null;

  if (!compilerModulePromise) {
    compilerModulePromise = (async () => {
      try {
        // When the compiler WASM is added, update this import path.
        // The module should expose a `compile_move_source(source, namedAddresses)` function.
        // const mod = await import("../wasm/move_compiler_wasm.js");
        // await mod.default();
        // return mod as unknown as MoveCompilerWasmModule;
        return null;
      } catch {
        compilerModulePromise = null;
        return null;
      }
    })();
  }

  return compilerModulePromise;
}

/**
 * Compile Move source code to bytecode using the compiler WASM.
 * Returns `null` if the compiler is not available.
 */
export async function compileMoveSource(
  source: string,
  namedAddresses: NamedAddressMap,
): Promise<CompileResult | null> {
  const compiler = await loadMoveCompilerWasm();
  if (!compiler) return null;

  return compiler.compile_move_source(source, JSON.stringify(namedAddresses));
}
