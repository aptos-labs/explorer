import {isUIntString, parseOptionBytesHex} from "./moveResourceBytes";

export const CONFIDENTIAL_ASSET_GLOBAL_CONFIG_RESOURCE =
  "0x1::confidential_asset::GlobalConfig" as const;

export type ParsedAuditorConfig = {
  encryptionKeyHex: string | null;
  epoch: string;
};

export type ParsedConfidentialAssetGlobalConfig = {
  allowListEnabled: boolean;
  globalAuditor: ParsedAuditorConfig;
  extendRefObjectAddress: string | null;
};

export function isConfidentialAssetGlobalConfigResource(type: string): boolean {
  return type === CONFIDENTIAL_ASSET_GLOBAL_CONFIG_RESOURCE;
}

function parseAuditorConfig(value: unknown): ParsedAuditorConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (!isUIntString(record.epoch)) {
    return null;
  }
  return {
    encryptionKeyHex: parseOptionBytesHex(record.ek),
    epoch: record.epoch,
  };
}

function parseExtendRefSelf(extendRef: unknown): string | null {
  if (!extendRef || typeof extendRef !== "object" || Array.isArray(extendRef)) {
    return null;
  }
  const self = (extendRef as {self?: unknown}).self;
  return typeof self === "string" ? self : null;
}

export function parseConfidentialAssetGlobalConfigData(
  data: unknown,
): ParsedConfidentialAssetGlobalConfig | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  const record = data as Record<string, unknown>;
  if (typeof record.allow_list_enabled !== "boolean") {
    return null;
  }
  const globalAuditor = parseAuditorConfig(record.global_auditor);
  if (!globalAuditor) {
    return null;
  }

  return {
    allowListEnabled: record.allow_list_enabled,
    globalAuditor,
    extendRefObjectAddress: parseExtendRefSelf(record.extend_ref),
  };
}
