import {describe, expect, it} from "vitest";
import {pathSplatToSegments} from "./routerParams";

describe("pathSplatToSegments", () => {
  it("splits string splats", () => {
    expect(pathSplatToSegments("code/mod/fn")).toEqual(["code", "mod", "fn"]);
  });

  it("handles string[] splats", () => {
    expect(pathSplatToSegments(["code/mod", "fn"])).toEqual([
      "code",
      "mod",
      "fn",
    ]);
  });

  it("returns [] for nullish or unsupported shapes", () => {
    expect(pathSplatToSegments(undefined)).toEqual([]);
    expect(pathSplatToSegments(null)).toEqual([]);
    expect(pathSplatToSegments({})).toEqual([]);
  });
});
