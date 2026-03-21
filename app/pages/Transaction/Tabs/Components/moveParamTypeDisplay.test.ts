import {describe, expect, it} from "vitest";
import {
  getParamTypeDisplay,
  shortenTypeTagForBadge,
} from "./moveParamTypeDisplay";
import {parseTypeTag} from "@aptos-labs/ts-sdk";

describe("getParamTypeDisplay", () => {
  it("returns Object badge for std object type", () => {
    const t = "0x1::object::Object<0x1::fungible_asset::ConcurrentSupply>";
    expect(getParamTypeDisplay(t)).toEqual({
      kind: "badge",
      label: "Object",
      tooltip: t,
    });
  });

  it("returns String badge for std string type", () => {
    const t = "0x1::string::String";
    expect(getParamTypeDisplay(t)).toEqual({
      kind: "badge",
      label: "String",
      tooltip: t,
    });
  });

  it("returns Option badge with shortened inner and full tooltip", () => {
    const t = "0x1::option::Option<0x1::string::String>";
    expect(getParamTypeDisplay(t)).toEqual({
      kind: "badge",
      label: "Option<String>",
      tooltip: t,
    });
  });

  it("returns vector badge with shortened inner and full tooltip", () => {
    const t = "vector<0x1::string::String>";
    expect(getParamTypeDisplay(t)).toEqual({
      kind: "badge",
      label: "vector<String>",
      tooltip: t,
    });
  });

  it("prefixes vector badge when type is a reference", () => {
    const t = "vector<u8>";
    expect(getParamTypeDisplay(`&${t}`)).toEqual({
      kind: "badge",
      label: "&vector<u8>",
      tooltip: `&${t}`,
    });
  });

  it("prefixes label when type is a reference", () => {
    const t =
      "&0x1::object::Object<0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>>";
    expect(getParamTypeDisplay(t)).toEqual({
      kind: "badge",
      label: "&Object",
      tooltip: t,
    });
  });

  it("returns plain for primitives", () => {
    expect(getParamTypeDisplay("u64")).toEqual({
      kind: "plain",
      text: "u64",
    });
  });

  it("returns plain for unknown placeholder", () => {
    expect(getParamTypeDisplay("unknown")).toEqual({
      kind: "plain",
      text: "unknown",
    });
  });

  it("normalizes whitespace for unknown placeholder", () => {
    expect(getParamTypeDisplay("  unknown  ")).toEqual({
      kind: "plain",
      text: "unknown",
    });
  });
});

describe("shortenTypeTagForBadge", () => {
  it("truncates long account addresses in struct path", () => {
    const longAddr =
      "0x0000000000000000000000000000000000000000000000000000000000000f01";
    const tag = parseTypeTag(`${longAddr}::my_module::MyStruct`, {
      allowGenerics: true,
    });
    const s = shortenTypeTagForBadge(tag);
    expect(s).toContain("…");
    expect(s).toContain("::my_module::MyStruct");
  });
});
