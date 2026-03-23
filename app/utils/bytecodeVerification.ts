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
}): Promise<BytecodeVerificationResult> {
  const {moduleBytecodeHex, publishedSourceHex} = opts;

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

    // --- 5. Compiler verification (future) ---
    checks.push({
      label: "Compilation verification",
      passed: false,
      detail:
        "Full bytecode verification via recompilation requires the Move compiler WASM (not yet available)",
    });

    const allCorePassed = checks
      .filter((c) => c.label !== "Compilation verification")
      .every((c) => c.passed);

    const status: VerificationStatus = allCorePassed
      ? "partial"
      : similarity >= 0.7
        ? "partial"
        : "unverified";

    return buildResult(status, checks, metadata, namedAddresses, isPreMove2);
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
    compilerAvailable: false,
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

function decodeHexSource(hexStr: string): string {
  const cleaned = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
  const bytes = new Uint8Array(
    cleaned.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
  );
  return new TextDecoder().decode(bytes);
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
