/* tslint:disable */
/* eslint-disable */

/**
 * Compilation result returned to JavaScript
 */
export class CompilationResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get full result as JSON
   */
  toJSON(): string;
  /**
   * Get compiled bytecode (only if successful)
   */
  readonly bytecode: Uint8Array;
  /**
   * Get compilation errors as JSON array
   */
  readonly errors: string;
  /**
   * Check if compilation was successful
   */
  readonly success: boolean;
  /**
   * Get compilation warnings as JSON array
   */
  readonly warnings: string;
}

/**
 * In-memory Move package builder for WASM
 *
 * This allows building Move packages entirely in memory without filesystem access.
 * JavaScript provides all source files and dependencies.
 */
export class MovePackage {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Add a named address mapping
   */
  add_address(name: string, address: string): void;
  /**
   * Add a dependency
   */
  add_dependency(name: string, path: string): void;
  /**
   * Add a source file to the package
   *
   * # Arguments
   * * `path` - Relative path like "sources/MyModule.move"
   * * `content` - Move source code
   */
  add_source(path: string, content: string): void;
  /**
   * Build the package and generate bytecode for all modules
   *
   * # Returns
   * CompilationResult with combined bytecode or errors
   */
  build(): CompilationResult;
  /**
   * Get package metadata as JSON
   */
  get_metadata(): string;
  /**
   * Get list of source files
   */
  get_sources(): string[];
  /**
   * Create a new Move package
   */
  constructor(name: string, version: string);
}

/**
 * Package metadata for Move.toml
 */
export class PackageMetadata {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Add an address mapping
   */
  add_address(name: string, address: string): void;
  /**
   * Add a dependency
   */
  add_dependency(name: string, path: string): void;
  /**
   * Create new package metadata
   */
  constructor(name: string, version: string);
  /**
   * Convert to JSON
   */
  toJSON(): string;
}

/**
 * Compile a single Move module from source code (filesystem-free!)
 *
 * # Arguments
 * * `source` - Move source code
 * * `address` - Named address for the module (e.g., "0x1")
 * * `module_name` - Name of the module
 *
 * # Returns
 * CompilationResult with bytecode or errors
 *
 * # Implementation
 * Uses the new `run_move_compiler_from_sources()` API - no temp files needed!
 */
export function compile_module(
  source: string,
  address: string,
  module_name: string,
): CompilationResult;

/**
 * Compile a single Move module with additional dependency sources.
 *
 * `deps_json` is a JSON array of `{"path":"...", "content":"..."}` objects.
 * These are treated as library sources (dependencies) so the compiler can
 * resolve `use` imports that are not part of the bundled move-stdlib.
 *
 * `extra_named_addresses_json` is a JSON object like `{"name":"0x1",...}`.
 */
export function compile_module_with_deps(
  source: string,
  address: string,
  module_name: string,
  deps_json: string,
  extra_named_addresses_json: string,
): CompilationResult;

/**
 * Compile a Move script from source code (filesystem-free!)
 */
export function compile_script(
  source: string,
  address: string,
): CompilationResult;

/**
 * Get library version and build information
 */
export function get_version_info(): string;

/**
 * Initialize panic hook for better error messages in browser console
 */
export function init_panic_hook(): void;

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_compilationresult_free: (a: number, b: number) => void;
  readonly __wbg_movepackage_free: (a: number, b: number) => void;
  readonly __wbg_packagemetadata_free: (a: number, b: number) => void;
  readonly compilationresult_bytecode: (a: number, b: number) => void;
  readonly compilationresult_errors: (a: number, b: number) => void;
  readonly compilationresult_success: (a: number) => number;
  readonly compilationresult_toJSON: (a: number, b: number) => void;
  readonly compilationresult_warnings: (a: number, b: number) => void;
  readonly compile_module: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => number;
  readonly compile_module_with_deps: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
  ) => number;
  readonly compile_script: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => number;
  readonly get_version_info: (a: number) => void;
  readonly init_panic_hook: () => void;
  readonly movepackage_add_address: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly movepackage_add_dependency: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly movepackage_add_source: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly movepackage_build: (a: number) => number;
  readonly movepackage_get_metadata: (a: number, b: number) => void;
  readonly movepackage_get_sources: (a: number, b: number) => void;
  readonly movepackage_new: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => number;
  readonly packagemetadata_add_address: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly packagemetadata_add_dependency: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
  ) => void;
  readonly packagemetadata_new: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => number;
  readonly packagemetadata_toJSON: (a: number, b: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export2: (a: number, b: number) => number;
  readonly __wbindgen_export3: (
    a: number,
    b: number,
    c: number,
    d: number,
  ) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(
  module: {module: SyncInitInput} | SyncInitInput,
): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | {module_or_path: InitInput | Promise<InitInput>}
    | InitInput
    | Promise<InitInput>,
): Promise<InitOutput>;
