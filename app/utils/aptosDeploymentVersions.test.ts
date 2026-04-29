// Covers FEAT-RELEASES-001 (network deployment version helpers)
import {describe, expect, it} from "vitest";
import {
  frameworkReleaseFromGasFeatureVersion,
  maxBytecodeFormatVersionFromFlags,
} from "./aptosDeploymentVersions";

describe("aptosDeploymentVersions", () => {
  it("maps gas feature_version 47 to framework release 1.43", () => {
    expect(frameworkReleaseFromGasFeatureVersion(47)).toBe("1.43");
  });

  it("returns null for unknown gas feature versions", () => {
    expect(frameworkReleaseFromGasFeatureVersion(999)).toBeNull();
  });

  it("computes max bytecode format from VM Binary Format flags", () => {
    expect(maxBytecodeFormatVersionFromFlags([1, 5])).toBe(6);
    expect(maxBytecodeFormatVersionFromFlags([1, 40])).toBe(7);
    expect(maxBytecodeFormatVersionFromFlags([102, 106])).toBe(10);
    expect(maxBytecodeFormatVersionFromFlags([1])).toBe(5);
  });
});
