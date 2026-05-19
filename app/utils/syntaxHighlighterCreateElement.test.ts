import {describe, expect, it} from "vitest";
import {syntaxHighlighterCreateElement} from "./syntaxHighlighterCreateElement";

// Covers FEAT-MODULES-001 — module code / view tab syntax highlighting
describe("syntaxHighlighterCreateElement", () => {
  it("renders a text node without throwing", () => {
    const node = syntaxHighlighterCreateElement({
      node: {type: "text", value: "public fun balance()"},
      stylesheet: {},
      useInlineStyles: true,
      key: "seg-0",
    });
    expect(node).toBeTruthy();
  });
});
