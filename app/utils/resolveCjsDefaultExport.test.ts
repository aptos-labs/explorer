import {describe, expect, it} from "vitest";
import {resolveCjsDefaultExport} from "./resolveCjsDefaultExport";

describe("resolveCjsDefaultExport", () => {
  const echo = (x: string) => x;

  it("returns a function passed directly", () => {
    expect(resolveCjsDefaultExport(echo, "test")).toBe(echo);
  });

  it("unwraps a single default wrapper", () => {
    expect(resolveCjsDefaultExport({default: echo}, "test")).toBe(echo);
  });

  it("unwraps double default wrappers (CJS + ESM interop)", () => {
    expect(resolveCjsDefaultExport({default: {default: echo}}, "test")).toBe(
      echo,
    );
  });

  it("throws when no callable export is found", () => {
    expect(() =>
      resolveCjsDefaultExport({default: {foo: 1}}, "test-module"),
    ).toThrow(/callable default export.*test-module/);
  });
});

describe("syntaxHighlighter create-element interop", () => {
  it("loads a callable createElement from the CJS subpath", async () => {
    const mod = await import(
      "react-syntax-highlighter/dist/cjs/create-element.js"
    );
    const createElement = resolveCjsDefaultExport<
      (props: {
        node: {type: string; value?: string};
        stylesheet: Record<string, unknown>;
        useInlineStyles: boolean;
        key?: string;
      }) => unknown
    >(mod.default, "react-syntax-highlighter/dist/cjs/create-element.js");

    expect(typeof createElement).toBe("function");
    const node = createElement({
      node: {type: "text", value: "hello"},
      stylesheet: {},
      useInlineStyles: true,
      key: "t0",
    });
    expect(node).toBeTruthy();
  });
});
