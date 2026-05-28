import {describe, expect, it} from "vitest";
import {
  CONFIDENTIAL_ASSET_GLOBAL_CONFIG_RESOURCE,
  parseConfidentialAssetGlobalConfigData,
} from "./confidentialAssetGlobalConfig";

const POOL_OBJECT =
  "0x0000000000000000000000000000000000000000000000000000000000000abc";

describe("ConfidentialAsset GlobalConfig parsing", () => {
  it("recognizes the framework resource type", () => {
    expect(CONFIDENTIAL_ASSET_GLOBAL_CONFIG_RESOURCE).toBe(
      "0x1::confidential_asset::GlobalConfig",
    );
  });

  it("parses allow list, global auditor, and extend ref", () => {
    const parsed = parseConfidentialAssetGlobalConfigData({
      allow_list_enabled: true,
      global_auditor: {
        ek: {vec: ["0x010203"]},
        epoch: "2",
      },
      extend_ref: {self: POOL_OBJECT},
    });
    expect(parsed).toEqual({
      allowListEnabled: true,
      globalAuditor: {
        encryptionKeyHex: "0x010203",
        epoch: "2",
      },
      extendRefObjectAddress: POOL_OBJECT,
    });
  });

  it("parses disabled allow list and empty auditor key", () => {
    expect(
      parseConfidentialAssetGlobalConfigData({
        allow_list_enabled: false,
        global_auditor: {ek: {vec: []}, epoch: "0"},
        extend_ref: {self: POOL_OBJECT},
      }),
    ).toEqual({
      allowListEnabled: false,
      globalAuditor: {encryptionKeyHex: null, epoch: "0"},
      extendRefObjectAddress: POOL_OBJECT,
    });
  });

  it("returns null for invalid shapes", () => {
    expect(parseConfidentialAssetGlobalConfigData(null)).toBeNull();
    expect(
      parseConfidentialAssetGlobalConfigData({
        allow_list_enabled: "yes",
        global_auditor: {ek: {vec: []}, epoch: "0"},
        extend_ref: {self: POOL_OBJECT},
      }),
    ).toBeNull();
  });
});
