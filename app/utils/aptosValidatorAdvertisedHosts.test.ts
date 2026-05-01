import {describe, expect, it} from "vitest";
import {
  extractAdvertisedHostnameFromAddressBlob,
  modeGitHash,
  normalizeAptosCoreGitHash,
} from "./aptosValidatorAdvertisedHosts";

// Covers FEAT-RELEASES-001 (validator advertised hostname parsing helpers)

describe("normalizeAptosCoreGitHash", () => {
  it("accepts lowercase 40-char hex", () => {
    const h = "9bd3d6d15afcf579d4745b761fe8913026354f9d";
    expect(normalizeAptosCoreGitHash(h)).toBe(h);
  });

  it("normalizes uppercase to lowercase", () => {
    expect(
      normalizeAptosCoreGitHash("9BD3D6D15AFCF579D4745B761FE8913026354F9D"),
    ).toBe("9bd3d6d15afcf579d4745b761fe8913026354f9d");
  });

  it("rejects wrong length and non-hex", () => {
    expect(normalizeAptosCoreGitHash("abc")).toBeNull();
    expect(normalizeAptosCoreGitHash(`g${"0".repeat(39)}`)).toBeNull();
    expect(normalizeAptosCoreGitHash(null)).toBeNull();
  });
});

describe("extractAdvertisedHostnameFromAddressBlob", () => {
  it("extracts DNS hostname from mainnet-style validator blob", () => {
    const hex =
      "016804023d76616c696461746f722e62626237366432642d303262352d346533652d626663332d3966313061326536393834392e6170746f732e6269736f6e2e72756e05241807203601215a079b0114a32104bd02149cf2258a206c8f8c79790e0684f4adfeae400800";
    expect(extractAdvertisedHostnameFromAddressBlob(hex)).toBe(
      "validator.bbb76d2d-02b5-4e3e-bfc3-9f10a2e69849.aptos.bison.run",
    );
  });

  it("returns null for empty or unusable blobs", () => {
    expect(extractAdvertisedHostnameFromAddressBlob("")).toBeNull();
    expect(extractAdvertisedHostnameFromAddressBlob("0x00")).toBeNull();
    expect(extractAdvertisedHostnameFromAddressBlob("zz")).toBeNull();
  });
});

describe("modeGitHash", () => {
  it("returns the hash with highest count, lexicographic tie-break", () => {
    expect(modeGitHash(["a".repeat(40), "a".repeat(40), "b".repeat(40)])).toBe(
      "a".repeat(40),
    );
    expect(modeGitHash(["c".repeat(40), "b".repeat(40), "b".repeat(40)])).toBe(
      "b".repeat(40),
    );
  });

  it("returns null for empty input", () => {
    expect(modeGitHash([])).toBeNull();
  });
});
