import {Hex} from "@aptos-labs/ts-sdk";
import pako from "pako";
import type {PackageMetadata} from "../api/hooks/useGetAccountResource";

export const MOVE_2_MIN_BYTECODE_VERSION = 6;

const FRAMEWORK_ADDRESS = "0x1";

function isFrameworkAddress(addr: string): boolean {
  const normalized = addr.toLowerCase().replace(/^0x0*/, "0x");
  return normalized === "0x1";
}

export type VerificationStatus = "verified" | "mismatch" | "error";

export type VerificationStep = {
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
  rawErrors?: string[];
};

export type BytecodeVerificationResult = {
  status: VerificationStatus;
  steps: VerificationStep[];
  error?: string;
};

/**
 * Verify a module's published source matches its on-chain bytecode.
 *
 * Flow:
 *  1. Decompile the on-chain bytecode back to Move source.
 *  2. Compile the decompiled source → "reference bytecode".
 *  3. Compile the published source → "published bytecode".
 *  4. Compare: if reference == published the source is verified.
 *
 * The `onProgress` callback is invoked after each step so the UI can
 * show a live progress indicator.
 */
export async function verifyModuleBytecode(opts: {
  moduleBytecodeHex: string;
  publishedSourceHex: string;
  allPackages?: PackageMetadata[];
  moduleAddress?: string;
  networkName?: string;
  onProgress?: (steps: VerificationStep[]) => void;
}): Promise<BytecodeVerificationResult> {
  const {
    moduleBytecodeHex,
    publishedSourceHex,
    allPackages,
    moduleAddress,
    networkName,
    onProgress,
  } = opts;

  const steps: VerificationStep[] = [
    {label: "Decompile on-chain bytecode", status: "pending"},
    {label: "Compile decompiled source", status: "pending"},
    {label: "Compile published source", status: "pending"},
    {label: "Compare bytecodes", status: "pending"},
  ];

  const emit = () => onProgress?.([...steps]);

  try {
    const {getModuleMetadata, normalizeBytecodeHex, getDecompiledCodeView} =
      await import("./moveDecompiler");
    const {compileMoveModuleWithDeps} = await import("./moveCompiler");

    const metadata = await getModuleMetadata(moduleBytecodeHex);
    const addr = moduleAddress ?? metadata.address ?? "0x1";

    let allDeps = allPackages ?? [];
    if (!isFrameworkAddress(addr)) {
      const frameworkPkgs = await fetchFrameworkPackages(networkName);
      allDeps = [...allDeps, ...frameworkPkgs];
    }

    const depFiles = buildDependencyFiles(allDeps, metadata.name);
    const extraAddresses = buildNamedAddressMap(allDeps, addr);

    const totalDepModules = allDeps.reduce(
      (n, pkg) => n + pkg.modules.length,
      0,
    );

    // --- Step 1: Decompile ---
    steps[0].status = "running";
    emit();

    const normalizedHex = normalizeBytecodeHex(moduleBytecodeHex);
    let decompiledSource: string;
    try {
      decompiledSource = await getDecompiledCodeView(
        normalizedHex,
        "decompiled-source",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      steps[0].status = "error";
      steps[0].detail = `Decompilation failed: ${msg}`;
      steps[0].rawErrors = [msg];
      emit();
      return {status: "error", steps, error: steps[0].detail};
    }
    steps[0].status = "done";
    steps[0].detail = `Decompiled ${decompiledSource.length} chars (${totalDepModules} dep modules, ${Object.keys(extraAddresses).length} named addrs)`;
    emit();

    // --- Step 2: Compile decompiled source → reference bytecode ---
    steps[1].status = "running";
    emit();

    const refResult = await compileMoveModuleWithDeps(
      decompiledSource,
      addr,
      metadata.name,
      depFiles,
      extraAddresses,
    );
    if (!refResult.success || refResult.bytecode.length === 0) {
      const summary = summarizeCompileErrors(refResult.errors);
      steps[1].status = "error";
      steps[1].detail = `Decompiled source failed to compile: ${summary}`;
      steps[1].rawErrors = refResult.errors;
      emit();
      return {status: "error", steps, error: steps[1].detail};
    }
    steps[1].status = "done";
    steps[1].detail = `Compiled to ${refResult.bytecode.length} bytes`;
    emit();

    // --- Step 3: Compile published source → published bytecode ---
    steps[2].status = "running";
    emit();

    const publishedDecoded = decodeHexSource(publishedSourceHex);
    if (!publishedDecoded) {
      steps[2].status = "error";
      steps[2].detail = "Failed to decode published source";
      emit();
      return {status: "error", steps, error: steps[2].detail};
    }

    const pubResult = await compileMoveModuleWithDeps(
      publishedDecoded,
      addr,
      metadata.name,
      depFiles,
      extraAddresses,
    );
    if (!pubResult.success || pubResult.bytecode.length === 0) {
      const summary = summarizeCompileErrors(pubResult.errors);
      steps[2].status = "error";
      steps[2].detail = `Published source failed to compile: ${summary}`;
      steps[2].rawErrors = pubResult.errors;
      emit();
      return {status: "error", steps, error: steps[2].detail};
    }
    steps[2].status = "done";
    steps[2].detail = `Compiled to ${pubResult.bytecode.length} bytes`;
    emit();

    // --- Step 4: Compare ---
    steps[3].status = "running";
    emit();

    const refBytes = refResult.bytecode;
    const pubBytes = pubResult.bytecode;

    const match =
      refBytes.length === pubBytes.length &&
      refBytes.every((b, i) => b === pubBytes[i]);

    steps[3].status = "done";
    steps[3].detail = match
      ? `Bytecodes match (${refBytes.length} bytes)`
      : `Bytecodes differ (decompiled: ${refBytes.length} bytes, published: ${pubBytes.length} bytes)`;
    emit();

    return {status: match ? "verified" : "mismatch", steps};
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {status: "error", steps, error: msg};
  }
}

let frameworkPackagesCache: PackageMetadata[] | null = null;

async function fetchFrameworkPackages(
  networkName?: string,
): Promise<PackageMetadata[]> {
  if (frameworkPackagesCache) return frameworkPackagesCache;

  const {networks} = await import("../lib/constants");
  const network = networkName ?? "mainnet";
  const baseUrl = (networks[network] ?? networks.mainnet).replace(/\/$/, "");

  try {
    const resp = await fetch(
      `${baseUrl}/accounts/${FRAMEWORK_ADDRESS}/resource/0x1::code::PackageRegistry`,
    );
    if (!resp.ok) return [];

    const json = await resp.json();
    const pkgs: PackageMetadata[] = (json?.data?.packages ?? []).map(
      (pkg: PackageMetadata) => ({
        name: pkg.name,
        modules: pkg.modules ?? [],
        upgrade_policy: pkg.upgrade_policy,
        upgrade_number: pkg.upgrade_number,
        source_digest: pkg.source_digest,
        manifest: pkg.manifest,
      }),
    );

    frameworkPackagesCache = pkgs;
    return pkgs;
  } catch {
    return [];
  }
}

function buildDependencyFiles(
  packages: PackageMetadata[],
  targetModuleName: string,
): Array<{path: string; content: string}> {
  const deps: Array<{path: string; content: string}> = [];
  for (const pkg of packages) {
    for (const mod of pkg.modules) {
      if (mod.name === targetModuleName) continue;
      const decoded = decodeHexSource(mod.source);
      if (decoded) {
        deps.push({path: `${mod.name}.move`, content: decoded});
      }
    }
  }
  return deps;
}

const WELL_KNOWN_FRAMEWORK_NAMES = new Set([
  "std",
  "aptos_std",
  "aptos_framework",
  "aptos_token",
  "aptos_token_objects",
]);

function buildNamedAddressMap(
  packages: PackageMetadata[],
  ownerAddress: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const pkg of packages) {
    for (const mod of pkg.modules) {
      const decoded = decodeHexSource(mod.source);
      if (!decoded) continue;
      const match = decoded.match(/module\s+(\w+)::\w+/);
      if (!match?.[1] || match[1].startsWith("0x")) continue;
      map[match[1]] = WELL_KNOWN_FRAMEWORK_NAMES.has(match[1])
        ? FRAMEWORK_ADDRESS
        : ownerAddress;
    }
  }
  return map;
}

function summarizeCompileErrors(errors: string[]): string {
  if (errors.length === 0) return "unknown error";

  const lc = (s: string) => s.toLowerCase();
  const buckets: Record<string, {count: number; label: string}> = {
    unboundModule: {count: 0, label: "unbound module"},
    unknownAttr: {count: 0, label: "unknown attribute"},
    addrNoValue: {count: 0, label: "address with no value"},
  };

  let otherCount = 0;
  for (const e of errors) {
    const el = lc(e);
    if (el.includes("unbound module")) buckets.unboundModule.count++;
    else if (el.includes("unknown attribute")) buckets.unknownAttr.count++;
    else if (el.includes("address with no value")) buckets.addrNoValue.count++;
    else otherCount++;
  }

  const parts: string[] = [];
  for (const b of Object.values(buckets)) {
    if (b.count > 0) parts.push(`${b.count} ${b.label}`);
  }
  if (otherCount > 0) parts.push(`${otherCount} other`);

  return `${errors.length} issue(s): ${parts.join(", ")}`;
}

function decodeHexSource(hexStr: string): string {
  try {
    return pako.ungzip(Hex.fromHexString(hexStr).toUint8Array(), {
      to: "string",
    });
  } catch {
    return "";
  }
}
