import {describe, expect, it} from "vitest";
import {
  parseRustFeatureFlagEnumSource,
  rustEnumVariantToTitleCase,
} from "./aptosFeatureFlagsUpstream";

const SAMPLE_ENUM = `
pub enum FeatureFlag {
 CODE_DEPENDENCY_CHECK = 1,
 /// doc line
 TREAT_FRIEND_AS_PRIVATE = 2,
 #[allow(dead_code)]
 SHA_512_AND_RIPEMD_160_NATIVES = 3,
 _SIGNATURE_CHECKER_V2 = 18,
 VERSIONED_TRANSACTION_VALIDATION = 112,
}

impl Foo {}
`;

describe("rustEnumVariantToTitleCase", () => {
  it("title-cases snake_case and strips leading underscores", () => {
    expect(rustEnumVariantToTitleCase("RESOURCE_GROUPS")).toBe(
      "Resource Groups",
    );
    expect(rustEnumVariantToTitleCase("_SIGNATURE_CHECKER_V2")).toBe(
      "Signature Checker V2",
    );
    expect(rustEnumVariantToTitleCase("VERSIONED_TRANSACTION_VALIDATION")).toBe(
      "Versioned Transaction Validation",
    );
  });
});

describe("parseRustFeatureFlagEnumSource", () => {
  it("extracts id → title map from enum body", () => {
    const map = parseRustFeatureFlagEnumSource(SAMPLE_ENUM);
    expect(map.get(1)).toBe("Code Dependency Check");
    expect(map.get(2)).toBe("Treat Friend As Private");
    expect(map.get(3)).toBe("Sha 512 And Ripemd 160 Natives");
    expect(map.get(18)).toBe("Signature Checker V2");
    expect(map.get(112)).toBe("Versioned Transaction Validation");
  });

  it("returns empty map when enum is missing", () => {
    expect(parseRustFeatureFlagEnumSource("fn main() {}").size).toBe(0);
  });
});
