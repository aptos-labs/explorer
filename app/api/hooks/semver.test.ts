import {describe, expect, it} from "vitest";
import {compareSemverDesc, isStableSemver, parseSemver} from "./semver";

describe("parseSemver", () => {
  it("parses standard versions with and without a v prefix", () => {
    expect(parseSemver("1.2.3")).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: "",
    });
    expect(parseSemver("v1.2.3")).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: "",
    });
  });

  it("captures pre-release suffixes", () => {
    expect(parseSemver("1.2.3-rc.1")?.prerelease).toBe("rc.1");
    expect(parseSemver("v4.0.0-zeta.0")?.prerelease).toBe("zeta.0");
    expect(parseSemver("5.1.1-side-effect-free.0")?.prerelease).toBe(
      "side-effect-free.0",
    );
  });

  it("strips build metadata after a +", () => {
    expect(parseSemver("1.2.3+build.5")?.prerelease).toBe("");
  });

  it("returns null for unparseable strings", () => {
    expect(parseSemver("not-a-version")).toBeNull();
    expect(parseSemver("1.2")).toBeNull();
    // The +metadata regex is anchored after pre-release, but no leading number
    // should fail.
    expect(parseSemver("v")).toBeNull();
  });
});

describe("isStableSemver", () => {
  it("treats versions without a pre-release suffix as stable", () => {
    expect(isStableSemver("1.2.3")).toBe(true);
    expect(isStableSemver("v6.3.1")).toBe(true);
    expect(isStableSemver("v1.20.0")).toBe(true);
  });

  it("treats common pre-release tags as not stable", () => {
    expect(isStableSemver("1.2.3-rc.1")).toBe(false);
    expect(isStableSemver("v4.0.0-zeta.0")).toBe(false);
    expect(isStableSemver("1.0.0-alpha")).toBe(false);
    expect(isStableSemver("1.0.0-beta.2")).toBe(false);
    expect(isStableSemver("1.0.0-dev.1")).toBe(false);
  });

  it("treats unparseable versions as not stable", () => {
    expect(isStableSemver("aptos-cli-v9.2.0")).toBe(false);
    expect(isStableSemver("garbage")).toBe(false);
  });
});

describe("compareSemverDesc", () => {
  it("sorts newest first by major.minor.patch", () => {
    const sorted = ["1.2.3", "2.0.0", "1.10.0", "1.9.9"].sort(
      compareSemverDesc,
    );
    expect(sorted).toEqual(["2.0.0", "1.10.0", "1.9.9", "1.2.3"]);
  });

  it("places stable above pre-release of the same triple", () => {
    const sorted = ["1.0.0-rc.1", "1.0.0", "1.0.0-rc.2"].sort(
      compareSemverDesc,
    );
    expect(sorted[0]).toBe("1.0.0");
    // The two rc versions follow but their relative order is implementation
    // defined for our purposes — both must come after the stable.
    expect(sorted.slice(1).sort()).toEqual(["1.0.0-rc.1", "1.0.0-rc.2"]);
  });

  it("pushes unparseable versions to the bottom without crashing", () => {
    const sorted = ["1.0.0", "garbage", "2.0.0"].sort(compareSemverDesc);
    expect(sorted).toEqual(["2.0.0", "1.0.0", "garbage"]);
  });
});
