import {describe, expect, it} from "vitest";
import {
  isPlainObject,
  sortedKeys,
  tryObjectAddressInner,
} from "./eventDataStructuredViewUtils";

describe("eventDataStructuredViewUtils", () => {
  it("isPlainObject rejects arrays and class instances", () => {
    expect(isPlainObject({a: 1})).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
  });

  it("tryObjectAddressInner accepts single-key inner address objects", () => {
    expect(
      tryObjectAddressInner({
        inner:
          "0xd503b95164384a5ebbccbb5c4bdc8b4a5893d9651e9953abda8e1c22fcc1181d",
      }),
    ).toBe(
      "0xd503b95164384a5ebbccbb5c4bdc8b4a5893d9651e9953abda8e1c22fcc1181d",
    );
    expect(tryObjectAddressInner({inner: "not-an-address"})).toBeUndefined();
    expect(
      tryObjectAddressInner({
        inner: "0x1",
        extra: "x",
      }),
    ).toBeUndefined();
  });

  it("sortedKeys returns lexicographic order", () => {
    expect(sortedKeys({z: 1, a: 2, m: 3})).toEqual(["a", "m", "z"]);
  });
});
