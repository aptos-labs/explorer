import {describe, expect, it} from "vitest";
import {createFallbackAddressResult} from "./searchUtils";

describe("createFallbackAddressResult", () => {
  it("returns an address result for valid inputs", () => {
    const result = createFallbackAddressResult("0x1");
    expect(result).toEqual({
      label:
        "Address 0x0000000000000000000000000000000000000000000000000000000000000001",
      to: "/account/0x0000000000000000000000000000000000000000000000000000000000000001",
      type: "address",
    });
  });

  it("returns null for invalid inputs", () => {
    expect(createFallbackAddressResult("not-an-address")).toBeNull();
  });
});
