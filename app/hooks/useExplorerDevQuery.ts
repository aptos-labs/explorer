import {useSearch} from "../routing";

/**
 * When true, the UI may offer WASM **decompilation** (reconstructed Move source from bytecode).
 * Disassembly remains available without this flag. Enabled via `?dev=true` in the URL.
 */
export function useExplorerDevQuery(): boolean {
  const search = useSearch({strict: false}) as {dev?: unknown};
  return String(search?.dev ?? "").toLowerCase() === "true";
}
