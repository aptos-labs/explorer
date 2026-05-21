// Keyless/Poseidon is not used by the explorer. This stub replaces poseidon-lite
// in the client bundle (via vite.config.ts resolve.alias) to eliminate the ~610 KB
// data tables from the vendor-aptos chunk.
function unsupported(): never {
  throw new Error(
    "poseidon-lite is not supported in this build (keyless not used)",
  );
}

export const poseidon1 = unsupported;
export const poseidon2 = unsupported;
export const poseidon3 = unsupported;
export const poseidon4 = unsupported;
export const poseidon5 = unsupported;
export const poseidon6 = unsupported;
export const poseidon7 = unsupported;
export const poseidon8 = unsupported;
export const poseidon9 = unsupported;
export const poseidon10 = unsupported;
export const poseidon11 = unsupported;
export const poseidon12 = unsupported;
export const poseidon13 = unsupported;
export const poseidon14 = unsupported;
export const poseidon15 = unsupported;
export const poseidon16 = unsupported;
