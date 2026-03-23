import {describe, expect, it} from "vitest";
import {
  moveModuleFunctionCodePath,
  resolveMoveCodeLinkPath,
} from "./moveCodeNavigation";

const ctx = {packageAddress: "0xbeef", isObject: false} as const;

describe("moveModuleFunctionCodePath", () => {
  it("builds account modules code path", () => {
    expect(moveModuleFunctionCodePath(ctx, "coin", "transfer", "0x1")).toBe(
      "/account/0x1/modules/code/coin/transfer",
    );
  });

  it("builds object modules code path", () => {
    expect(
      moveModuleFunctionCodePath(
        {packageAddress: "0xbeef", isObject: true},
        "m",
        "f",
        "0xaa",
      ),
    ).toBe("/object/0xaa/modules/code/m/f");
  });
});

describe("resolveMoveCodeLinkPath", () => {
  it("resolves fully qualified calls", () => {
    expect(resolveMoveCodeLinkPath("0x1::coin::transfer", ctx)).toBe(
      "/account/0x0000000000000000000000000000000000000000000000000000000000000001/modules/code/coin/transfer",
    );
  });

  it("resolves package-relative module::function", () => {
    expect(resolveMoveCodeLinkPath("coin::transfer", ctx)).toBe(
      "/account/0xbeef/modules/code/coin/transfer",
    );
  });

  it("returns null for non-matches", () => {
    expect(resolveMoveCodeLinkPath("not a link", ctx)).toBeNull();
  });

  it("does not match when there is a suffix after module::function", () => {
    expect(resolveMoveCodeLinkPath("coin::transfer()", ctx)).toBeNull();
    expect(resolveMoveCodeLinkPath("coin::transfer extra", ctx)).toBeNull();
  });

  it("does not match when there is a prefix before module::function", () => {
    expect(resolveMoveCodeLinkPath("x coin::transfer", ctx)).toBeNull();
    expect(
      resolveMoveCodeLinkPath("prefix 0x1::coin::transfer", ctx),
    ).toBeNull();
  });
});
