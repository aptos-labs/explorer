import {describe, expect, it} from "vitest";
import {ResponseErrorType} from "../client";
import {
  mapRegistryQueryToAccountPackages,
  type PackageMetadata,
} from "./useGetAccountResource";

describe("mapRegistryQueryToAccountPackages", () => {
  it("treats NOT_FOUND as empty registry, not an error", () => {
    // Covers FEAT-MODULES-008 / PR review: PackageRegistry 404 → explanatory empty state
    const result = mapRegistryQueryToAccountPackages({
      data: undefined,
      isPending: false,
      isError: true,
      error: {type: ResponseErrorType.NOT_FOUND},
      isFetched: true,
    });
    expect(result.packages).toEqual([]);
    expect(result.isError).toBe(false);
    expect(result.error).toBeNull();
    expect(result.isFetched).toBe(true);
    expect(result.isPending).toBe(false);
  });

  it("forwards non-NOT_FOUND errors", () => {
    const err = {type: ResponseErrorType.UNHANDLED, message: "boom"};
    const result = mapRegistryQueryToAccountPackages({
      data: undefined,
      isPending: false,
      isError: true,
      error: err,
      isFetched: true,
    });
    expect(result.isError).toBe(true);
    expect(result.error).toEqual(err);
    expect(result.packages).toEqual([]);
  });

  it("maps successful registry data to sorted packages", () => {
    const pkg: PackageMetadata = {
      name: "z_pkg",
      modules: [{name: "m", source: "0x"}],
      upgrade_policy: {policy: 1},
      upgrade_number: "1",
      source_digest: "d",
      manifest: "",
    };
    const pkg2: PackageMetadata = {
      name: "a_pkg",
      modules: [{name: "n", source: "0x"}],
      upgrade_policy: {policy: 1},
      upgrade_number: "0",
      source_digest: "e",
      manifest: "",
    };
    const result = mapRegistryQueryToAccountPackages({
      data: {
        type: "0x1::code::PackageRegistry",
        data: {packages: [pkg, pkg2]},
      } as never,
      isPending: false,
      isError: false,
      error: null,
      isFetched: true,
    });
    expect(result.packages.map((p) => p.name)).toEqual(["a_pkg", "z_pkg"]);
    expect(result.isError).toBe(false);
  });
});
