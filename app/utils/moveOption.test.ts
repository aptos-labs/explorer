import {describe, expect, it} from "vitest";
import {unwrapMoveOptionVec} from "./moveOption";

describe("unwrapMoveOptionVec", () => {
  it("returns the first vec element when present", () => {
    expect(unwrapMoveOptionVec({vec: ["a"]})).toBe("a");
  });

  it("returns null for empty or missing vec", () => {
    expect(unwrapMoveOptionVec({vec: []})).toBeNull();
    expect(unwrapMoveOptionVec(undefined)).toBeNull();
    expect(unwrapMoveOptionVec("not an option")).toBeNull();
  });
});
