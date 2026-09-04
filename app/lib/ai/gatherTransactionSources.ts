import type {Types} from "~/types/aptos";
import {getAccountModule, getAccountResource} from "../../api";
import {isNotFoundError, type ResponseError} from "../../api/client";
import type {PackageMetadata} from "../../api/hooks/useGetAccountResource";
import type {AptosClient} from "../../api/legacyClient";
import {moveResourceData} from "../../api/moveResource";
import {transformCode} from "../../utils";
import {
  getDecompiledCodeView,
  getDecompiledScriptCodeView,
} from "../../utils/moveDecompiler";
import {extractDisplayableEntryFunctionPayload} from "../../utils/transactionPayload";
import {
  ledgerVersionFromTransaction,
  parseMoveFunctionId,
  scriptBytecodeFromTransaction,
  type TransactionSourceSnippet,
} from "./transactionContext";

export type TransactionSourceDeps = {
  getAccountResource: typeof getAccountResource;
  getAccountModule: typeof getAccountModule;
  decompileModule: (bytecodeHex: string) => Promise<string>;
  decompileScript: (bytecodeHex: string) => Promise<string>;
  decodePublishedSource: (raw: string) => string;
};

export function decodePublishedSource(raw: string): string {
  if (!raw || raw === "0x") {
    return "";
  }
  const unzipped = transformCode(raw);
  if (unzipped.trim()) {
    return unzipped;
  }
  if (raw.includes("module ") || raw.includes("script ")) {
    return raw;
  }
  return "";
}

const defaultDeps: TransactionSourceDeps = {
  getAccountResource,
  getAccountModule,
  decompileModule: (bytecodeHex) =>
    getDecompiledCodeView(bytecodeHex, "decompiled-source"),
  decompileScript: (bytecodeHex) =>
    getDecompiledScriptCodeView(bytecodeHex, "decompiled-source"),
  decodePublishedSource,
};

function findPublishedModuleSource(
  packages: PackageMetadata[] | undefined,
  moduleName: string,
  decode: (raw: string) => string,
): string {
  if (!packages) {
    return "";
  }
  for (const pkg of packages) {
    const mod = pkg.modules.find((module) => module.name === moduleName);
    if (mod?.source) {
      const decoded = decode(mod.source);
      if (decoded) {
        return decoded;
      }
    }
  }
  return "";
}

async function loadPackageRegistry(
  client: AptosClient,
  address: string,
  ledgerVersion: number | undefined,
  deps: TransactionSourceDeps,
): Promise<PackageMetadata[] | undefined> {
  try {
    const resource = await deps.getAccountResource(
      {
        address,
        resourceType: "0x1::code::PackageRegistry",
        ledgerVersion,
      },
      client,
    );
    const data = moveResourceData<{packages?: PackageMetadata[]}>(resource);
    return data?.packages;
  } catch (error) {
    if (isNotFoundError(error) || isNotFoundResponseError(error)) {
      return undefined;
    }
    throw error;
  }
}

function isNotFoundResponseError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "type" in error &&
    (error as ResponseError).type === "Not Found"
  );
}

async function loadModuleBytecode(
  client: AptosClient,
  address: string,
  moduleName: string,
  ledgerVersion: number | undefined,
  deps: TransactionSourceDeps,
): Promise<string | undefined> {
  try {
    const module = await deps.getAccountModule(
      {address, moduleName, ledgerVersion},
      client,
    );
    return module.bytecode;
  } catch (error) {
    if (isNotFoundError(error) || isNotFoundResponseError(error)) {
      return undefined;
    }
    throw error;
  }
}

export async function gatherTransactionSources(
  transaction: Types.Transaction,
  client: AptosClient,
  deps: Partial<TransactionSourceDeps> = {},
): Promise<TransactionSourceSnippet[]> {
  const resolved: TransactionSourceDeps = {...defaultDeps, ...deps};
  const sources: TransactionSourceSnippet[] = [];
  const ledgerVersion = ledgerVersionFromTransaction(transaction);

  const scriptBytecode = scriptBytecodeFromTransaction(transaction);
  if (scriptBytecode) {
    try {
      const code = await resolved.decompileScript(scriptBytecode);
      sources.push({
        kind: "script",
        identifier: "transaction script",
        origin: "decompiled",
        code,
        note: "Decompiled in the browser from script bytecode. Names and structure may not match original source.",
      });
    } catch (error) {
      sources.push({
        kind: "script",
        identifier: "transaction script",
        origin: "unavailable",
        code: "",
        note:
          error instanceof Error
            ? `Script decompilation failed: ${error.message}`
            : "Script decompilation failed",
      });
    }
  }

  const entry = extractDisplayableEntryFunctionPayload(transaction);
  const functionId = entry ? parseMoveFunctionId(entry.function) : undefined;
  if (!functionId) {
    return sources;
  }

  const identifier = `${functionId.address}::${functionId.moduleName}`;
  const packages = await loadPackageRegistry(
    client,
    functionId.address,
    ledgerVersion,
    resolved,
  );
  const published = findPublishedModuleSource(
    packages,
    functionId.moduleName,
    resolved.decodePublishedSource,
  );
  if (published) {
    sources.push({
      kind: "module",
      identifier,
      origin: "published",
      code: published,
    });
    return sources;
  }

  const bytecode = await loadModuleBytecode(
    client,
    functionId.address,
    functionId.moduleName,
    ledgerVersion,
    resolved,
  );
  if (bytecode) {
    try {
      const code = await resolved.decompileModule(bytecode);
      sources.push({
        kind: "module",
        identifier,
        origin: "decompiled",
        code,
        note: "On-chain package did not include published source. Decompiled in the browser from bytecode.",
      });
      return sources;
    } catch (error) {
      sources.push({
        kind: "module",
        identifier,
        origin: "unavailable",
        code: "",
        note:
          error instanceof Error
            ? `Module decompilation failed: ${error.message}`
            : "Module decompilation failed",
      });
      return sources;
    }
  }

  sources.push({
    kind: "module",
    identifier,
    origin: "unavailable",
    code: "",
    note: "No published source or bytecode was available for this module at the transaction version.",
  });
  return sources;
}
