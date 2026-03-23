import {Hex} from "@aptos-labs/ts-sdk";
import pako from "pako";
import type {PackageMetadata} from "../api/hooks/useGetAccountResource";
import type {ModuleMetadataResult} from "./moveDecompiler";

/**
 * Move 2 introduced bytecode version 6+. Modules compiled before Move 2
 * may produce decompiled output that cannot be faithfully re-compiled,
 * so source-level verification is unreliable for older formats.
 */
export const MOVE_2_MIN_BYTECODE_VERSION = 6;

export type VerificationStatus =
  | "verified"
  | "partial"
  | "unverified"
  | "error";

export type VerificationCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type NamedAddress = {
  name: string;
  address: string;
};

export type BytecodeVerificationResult = {
  status: VerificationStatus;
  statusLabel: string;
  checks: VerificationCheck[];
  metadata: ModuleMetadataResult | null;
  namedAddresses: NamedAddress[];
  isPreMove2: boolean;
  compilerAvailable: boolean;
  error?: string;
};

/**
 * Runs the full bytecode verification pipeline for a single module.
 *
 * Steps:
 *  1. Bytecode integrity – `verify_module` from the decompiler WASM.
 *  2. Metadata extraction – bytecode version, address, dependencies.
 *  3. Source availability – checks that the deployer published source.
 *  4. Decompile round-trip – decompiles and structurally compares with published source.
 *  5. (Future) Compile & compare – requires compiler WASM from the PR.
 */
export async function verifyModuleBytecode(opts: {
  moduleBytecodeHex: string;
  publishedSourceHex?: string;
  allPackages?: PackageMetadata[];
  moduleAddress?: string;
}): Promise<BytecodeVerificationResult> {
  const {moduleBytecodeHex, publishedSourceHex, allPackages, moduleAddress} =
    opts;

  const checks: VerificationCheck[] = [];
  let metadata: ModuleMetadataResult | null = null;
  let namedAddresses: NamedAddress[] = [];
  let isPreMove2 = false;

  try {
    const {
      getModuleMetadata,
      normalizeBytecodeHex,
      getDecompiledCodeView,
      verifyModuleIntegrity,
    } = await import("./moveDecompiler");

    // --- 1. Bytecode integrity ---
    let integrityPassed = false;
    try {
      integrityPassed = await verifyModuleIntegrity(moduleBytecodeHex);
    } catch {
      // verify throws on invalid bytecode or when WASM is unavailable
    }
    checks.push({
      label: "Bytecode integrity",
      passed: integrityPassed,
      detail: integrityPassed
        ? "Module bytecode passed structural verification"
        : "Module bytecode failed integrity check",
    });

    if (!integrityPassed) {
      return buildResult("error", checks, metadata, namedAddresses, isPreMove2);
    }

    // --- 2. Metadata extraction ---
    metadata = await getModuleMetadata(moduleBytecodeHex);
    isPreMove2 = metadata.version < MOVE_2_MIN_BYTECODE_VERSION;

    checks.push({
      label: "Bytecode version",
      passed: !isPreMove2,
      detail: isPreMove2
        ? `Bytecode version ${metadata.version} (pre-Move 2) – decompiled source may not round-trip faithfully`
        : `Bytecode version ${metadata.version} (Move 2+)`,
    });

    // --- Named addresses ---
    namedAddresses = extractNamedAddresses(metadata);

    // --- 3. Source availability ---
    const hasPublishedSource =
      !!publishedSourceHex &&
      publishedSourceHex !== "0x" &&
      publishedSourceHex.length > 2;

    checks.push({
      label: "Published source",
      passed: hasPublishedSource,
      detail: hasPublishedSource
        ? "Deployer published Move source code on-chain"
        : "No source code was published with this module",
    });

    if (!hasPublishedSource) {
      return buildResult(
        "unverified",
        checks,
        metadata,
        namedAddresses,
        isPreMove2,
      );
    }

    // --- 4. Decompile round-trip comparison ---
    const normalizedHex = normalizeBytecodeHex(moduleBytecodeHex);
    let decompiledSource: string;
    try {
      decompiledSource = await getDecompiledCodeView(
        normalizedHex,
        "decompiled-source",
      );
    } catch {
      checks.push({
        label: "Decompilation",
        passed: false,
        detail: "Failed to decompile bytecode for source comparison",
      });
      return buildResult(
        "partial",
        checks,
        metadata,
        namedAddresses,
        isPreMove2,
      );
    }

    const publishedDecoded = decodeHexSource(publishedSourceHex);
    const similarity = computeStructuralSimilarity(
      publishedDecoded,
      decompiledSource,
    );
    const similarityPct = Math.round(similarity * 100);

    checks.push({
      label: "Source comparison",
      passed: similarity >= 0.7,
      detail:
        similarity >= 0.9
          ? `Published source structurally matches decompiled output (${similarityPct}%)`
          : similarity >= 0.7
            ? `Published source partially matches decompiled output (${similarityPct}%)`
            : `Published source differs significantly from decompiled output (${similarityPct}%)`,
    });

    // --- 5. Compilation verification ---
    let compilationPassed = false;
    try {
      const {compileMoveModuleWithDeps} = await import("./moveCompiler");
      const addr = moduleAddress ?? metadata.address ?? "0x1";

      const depFiles = buildDependencyFiles(allPackages ?? [], metadata.name);
      const extraAddresses = buildNamedAddressMap(allPackages ?? [], addr);

      const compileResult = await compileMoveModuleWithDeps(
        publishedDecoded,
        addr,
        metadata.name,
        depFiles,
        extraAddresses,
      );

      if (compileResult.success && compileResult.bytecode.length > 0) {
        const {bytecodeHexToBytes} = await import("./moveDecompiler");
        const onChainBytes = bytecodeHexToBytes(moduleBytecodeHex);
        const compiledBytes = compileResult.bytecode;

        const bytecodeMatch =
          onChainBytes.length === compiledBytes.length &&
          onChainBytes.every((b, i) => b === compiledBytes[i]);

        compilationPassed = bytecodeMatch;
        checks.push({
          label: "Compilation verification",
          passed: bytecodeMatch,
          detail: bytecodeMatch
            ? "Published source recompiles to identical on-chain bytecode"
            : `Recompiled bytecode differs from on-chain (${compiledBytes.length} vs ${onChainBytes.length} bytes)`,
        });
      } else {
        const detail = summarizeCompileErrors(compileResult.errors);
        checks.push({
          label: "Compilation verification",
          passed: false,
          detail,
        });
      }
    } catch {
      checks.push({
        label: "Compilation verification",
        passed: false,
        detail:
          "Move compiler WASM could not be loaded for recompilation check",
      });
    }

    const allCorePassed = checks.every((c) => c.passed);
    const status: VerificationStatus = allCorePassed
      ? "verified"
      : compilationPassed
        ? "verified"
        : similarity >= 0.7
          ? "partial"
          : "unverified";

    return buildResult(
      status,
      checks,
      metadata,
      namedAddresses,
      isPreMove2,
      true,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      status: "error",
      statusLabel: "Verification error",
      checks,
      metadata,
      namedAddresses,
      isPreMove2,
      compilerAvailable: false,
      error: msg,
    };
  }
}

function buildResult(
  status: VerificationStatus,
  checks: VerificationCheck[],
  metadata: ModuleMetadataResult | null,
  namedAddresses: NamedAddress[],
  isPreMove2: boolean,
  compilerAvailable = false,
): BytecodeVerificationResult {
  const labelMap: Record<VerificationStatus, string> = {
    verified: "Bytecode verified",
    partial: "Partially verified",
    unverified: "Unverified",
    error: "Verification failed",
  };
  return {
    status,
    statusLabel: labelMap[status],
    checks,
    metadata,
    namedAddresses,
    isPreMove2,
    compilerAvailable,
  };
}

function extractNamedAddresses(metadata: ModuleMetadataResult): NamedAddress[] {
  const addresses: NamedAddress[] = [];
  if (metadata.address) {
    addresses.push({name: metadata.name, address: metadata.address});
  }
  for (const dep of metadata.dependencies) {
    const parts = dep.split("::");
    if (parts.length >= 2 && parts[0].startsWith("0x")) {
      const existing = addresses.find((a) => a.address === parts[0]);
      if (!existing) {
        addresses.push({name: parts[1], address: parts[0]});
      }
    }
  }
  return addresses;
}

/**
 * Collect all OTHER module sources from the account's packages as
 * dependency files for the compiler.  This lets intra-account `use`
 * imports resolve (e.g. `0x1::coin` can see `0x1::account`).
 */
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

/**
 * Extract named address mappings from published source `module` declarations.
 * e.g. `module aptos_framework::coin` → `aptos_framework` = address.
 */
function buildNamedAddressMap(
  packages: PackageMetadata[],
  address: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const pkg of packages) {
    for (const mod of pkg.modules) {
      const decoded = decodeHexSource(mod.source);
      if (!decoded) continue;
      const match = decoded.match(/module\s+(\w+)::\w+/);
      if (match?.[1] && !match[1].startsWith("0x")) {
        map[match[1]] = address;
      }
    }
  }
  return map;
}

function summarizeCompileErrors(errors: string[]): string {
  if (errors.length === 0) return "Recompilation failed: unknown error";

  const dedupErrors = [...new Set(errors)];
  const hasUnboundModule = dedupErrors.some((e) =>
    e.toLowerCase().includes("unbound module"),
  );

  if (hasUnboundModule) {
    const unboundCount = errors.filter((e) =>
      e.toLowerCase().includes("unbound module"),
    ).length;
    const otherErrors = dedupErrors.filter(
      (e) => !e.toLowerCase().includes("unbound module"),
    );
    const parts = [
      `${unboundCount} unbound module error(s) — module depends on other packages not available during standalone recompilation`,
    ];
    if (otherErrors.length > 0) {
      parts.push(`${otherErrors.length} other error(s)`);
    }
    return `Recompilation failed with ${errors.length} error(s): ${parts.join("; ")}`;
  }

  const preview = dedupErrors.slice(0, 3).join("; ");
  return `Recompilation failed with ${errors.length} error(s): ${preview}`;
}

/**
 * Decode hex-encoded published source.
 * Aptos PackageRegistry stores module source as gzip-compressed hex.
 */
function decodeHexSource(hexStr: string): string {
  try {
    return pako.ungzip(Hex.fromHexString(hexStr).toUint8Array(), {
      to: "string",
    });
  } catch {
    return "";
  }
}

/**
 * Structural similarity between two Move source strings.
 *
 * Normalises both inputs (strip comments, collapse whitespace) then
 * extracts "signature lines" (module/fun/struct/use declarations) and
 * computes Jaccard similarity on those lines.  A value of 1.0 means
 * identical structural signatures; 0.0 means no overlap.
 */
function computeStructuralSimilarity(a: string, b: string): number {
  const sigsA = extractSignatures(a);
  const sigsB = extractSignatures(b);

  if (sigsA.size === 0 && sigsB.size === 0) return 1;
  if (sigsA.size === 0 || sigsB.size === 0) return 0;

  let intersection = 0;
  for (const sig of sigsA) {
    if (sigsB.has(sig)) intersection++;
  }
  const union = new Set([...sigsA, ...sigsB]).size;
  return union === 0 ? 1 : intersection / union;
}

function extractSignatures(source: string): Set<string> {
  const normalized = source
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

  const sigs = new Set<string>();
  const patterns = [
    /(?:public\s+)?(?:entry\s+)?fun\s+\w+[^{]*/g,
    /struct\s+\w+[^{]*/g,
    /module\s+[\w:]+/g,
    /use\s+[\w:]+/g,
  ];
  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      sigs.add(match[0].trim().replace(/\s+/g, " "));
    }
  }
  return sigs;
}
