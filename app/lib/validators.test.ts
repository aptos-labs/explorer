// Covers FEAT-NETWORK-001 — Network name validation
// Covers FEAT-FLAGS-003 — Feature name validation
// Covers FEAT-ROUTING-003 — Constants used in entity path building
import {describe, expect, it} from "vitest";
import {
  BASE_URL,
  collectionV2Address,
  DEFAULT_DESCRIPTION,
  defaultFeatureName,
  defaultNetworkName,
  faMetadataResource,
  isValidFeatureName,
  isValidNetworkName,
  OCTA,
  objectCoreResource,
  tokenV2Address,
} from "./constants";

describe("FEAT-NETWORK-001 — isValidNetworkName", () => {
  it("accepts mainnet", () => {
    expect(isValidNetworkName("mainnet")).toBe(true);
  });

  it("accepts testnet", () => {
    expect(isValidNetworkName("testnet")).toBe(true);
  });

  it("accepts devnet", () => {
    expect(isValidNetworkName("devnet")).toBe(true);
  });

  it("accepts local", () => {
    expect(isValidNetworkName("local")).toBe(true);
  });

  it("accepts hidden networks", () => {
    expect(isValidNetworkName("decibel")).toBe(true);
    expect(isValidNetworkName("shelbynet")).toBe(true);
  });

  it("rejects unknown network names", () => {
    expect(isValidNetworkName("fakenet")).toBe(false);
    expect(isValidNetworkName("")).toBe(false);
  });
});

describe("FEAT-FLAGS-003 — isValidFeatureName", () => {
  it("accepts prod", () => {
    expect(isValidFeatureName("prod")).toBe(true);
  });

  it("accepts dev", () => {
    expect(isValidFeatureName("dev")).toBe(true);
  });

  it("accepts earlydev", () => {
    expect(isValidFeatureName("earlydev")).toBe(true);
  });

  it("rejects unknown feature names", () => {
    expect(isValidFeatureName("beta")).toBe(false);
    expect(isValidFeatureName("")).toBe(false);
  });

  it("default feature name is prod", () => {
    expect(defaultFeatureName).toBe("prod");
  });
});

describe("constants — well-known resource types", () => {
  it("OCTA is 10^8", () => {
    expect(OCTA).toBe(100000000);
  });

  it("objectCoreResource points to 0x1::object::ObjectCore", () => {
    expect(objectCoreResource).toBe("0x1::object::ObjectCore");
  });

  it("faMetadataResource points to 0x1::fungible_asset::Metadata", () => {
    expect(faMetadataResource).toBe("0x1::fungible_asset::Metadata");
  });

  it("tokenV2Address points to 0x4::token::Token", () => {
    expect(tokenV2Address).toBe("0x4::token::Token");
  });

  it("collectionV2Address points to 0x4::collection::Collection", () => {
    expect(collectionV2Address).toBe("0x4::collection::Collection");
  });

  it("BASE_URL is the production explorer URL", () => {
    expect(BASE_URL).toBe("https://explorer.aptoslabs.com");
  });

  it("DEFAULT_DESCRIPTION is non-empty", () => {
    expect(DEFAULT_DESCRIPTION.length).toBeGreaterThan(0);
  });
});
