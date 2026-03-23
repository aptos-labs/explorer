/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const __wbg_compilationresult_free: (a: number, b: number) => void;
export const __wbg_movepackage_free: (a: number, b: number) => void;
export const __wbg_packagemetadata_free: (a: number, b: number) => void;
export const compilationresult_bytecode: (a: number, b: number) => void;
export const compilationresult_errors: (a: number, b: number) => void;
export const compilationresult_success: (a: number) => number;
export const compilationresult_toJSON: (a: number, b: number) => void;
export const compilationresult_warnings: (a: number, b: number) => void;
export const compile_module: (
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
) => number;
export const compile_module_with_deps: (
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
export const compile_script: (
  a: number,
  b: number,
  c: number,
  d: number,
) => number;
export const get_version_info: (a: number) => void;
export const init_panic_hook: () => void;
export const movepackage_add_address: (
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
) => void;
export const movepackage_add_dependency: (
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
) => void;
export const movepackage_add_source: (
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
) => void;
export const movepackage_build: (a: number) => number;
export const movepackage_get_metadata: (a: number, b: number) => void;
export const movepackage_get_sources: (a: number, b: number) => void;
export const movepackage_new: (
  a: number,
  b: number,
  c: number,
  d: number,
) => number;
export const packagemetadata_add_address: (
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
) => void;
export const packagemetadata_add_dependency: (
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
) => void;
export const packagemetadata_new: (
  a: number,
  b: number,
  c: number,
  d: number,
) => number;
export const packagemetadata_toJSON: (a: number, b: number) => void;
export const __wbindgen_add_to_stack_pointer: (a: number) => number;
export const __wbindgen_export: (a: number, b: number, c: number) => void;
export const __wbindgen_export2: (a: number, b: number) => number;
export const __wbindgen_export3: (
  a: number,
  b: number,
  c: number,
  d: number,
) => number;
