import {describe, expect, it} from "vitest";
import type {MessageTree} from "./translate";
import {getMessage, interpolate, translate, translateList} from "./translate";

const en: MessageTree = {
  greeting: "Hello {name}",
  nested: {
    title: "Settings",
    items: ["One", "Two {value}"],
  },
  empty: "",
};

const es: MessageTree = {
  greeting: "Hola {name}",
  nested: {
    title: "Ajustes",
  },
};

describe("interpolate", () => {
  it("replaces named placeholders", () => {
    expect(interpolate("Hello {name}", {name: "Ada"})).toBe("Hello Ada");
  });

  it("leaves unknown placeholders intact", () => {
    expect(interpolate("Hello {name}", {})).toBe("Hello {name}");
  });

  it("stringifies numeric values", () => {
    expect(interpolate("{count} results", {count: 3})).toBe("3 results");
  });
});

describe("getMessage", () => {
  it("resolves nested string keys", () => {
    expect(getMessage(en, "nested.title")).toBe("Settings");
  });

  it("returns undefined for missing keys", () => {
    expect(getMessage(en, "missing.key")).toBeUndefined();
  });

  it("returns undefined when a path segment is a string", () => {
    expect(getMessage(en, "greeting.extra")).toBeUndefined();
  });
});

describe("translate", () => {
  it("returns the interpolated string from the first matching catalog", () => {
    expect(
      translate(
        [
          {locale: "es", messages: es},
          {locale: "en", messages: en},
        ],
        "greeting",
        {name: "Ada"},
      ),
    ).toBe("Hola Ada");
  });

  it("falls back to later catalogs when a key is missing", () => {
    expect(
      translate(
        [
          {locale: "es", messages: es},
          {locale: "en", messages: en},
        ],
        "empty",
      ),
    ).toBe("");
  });

  it("returns the key when no catalog has a string at that path", () => {
    expect(translate([{locale: "en", messages: en}], "does.not.exist")).toBe(
      "does.not.exist",
    );
  });
});

describe("translateList", () => {
  it("returns interpolated string arrays", () => {
    expect(
      translateList([{locale: "en", messages: en}], "nested.items", {
        value: "X",
      }),
    ).toEqual(["One", "Two X"]);
  });

  it("wraps a single string in an array", () => {
    expect(
      translateList([{locale: "en", messages: en}], "nested.title"),
    ).toEqual(["Settings"]);
  });

  it("returns an empty array when the key is missing", () => {
    expect(translateList([{locale: "en", messages: en}], "missing")).toEqual(
      [],
    );
  });
});
