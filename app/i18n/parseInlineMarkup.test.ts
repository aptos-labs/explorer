import {describe, expect, it} from "vitest";
import {isInternalHref, parseInlineMarkup} from "./parseInlineMarkup";

describe("parseInlineMarkup", () => {
  it("returns a single text node when there is no markup", () => {
    expect(parseInlineMarkup("Hello world")).toEqual([
      {type: "text", value: "Hello world"},
    ]);
  });

  it("parses bold, code, and markdown links", () => {
    expect(
      parseInlineMarkup("See **Settings** or [the guide](/guide) and `octas`."),
    ).toEqual([
      {type: "text", value: "See "},
      {type: "bold", value: "Settings"},
      {type: "text", value: " or "},
      {type: "link", href: "/guide", value: "the guide"},
      {type: "text", value: " and "},
      {type: "code", value: "octas"},
      {type: "text", value: "."},
    ]);
  });

  it("parses external links", () => {
    expect(parseInlineMarkup("[Panora](https://example.com)")).toEqual([
      {type: "link", href: "https://example.com", value: "Panora"},
    ]);
  });
});

describe("isInternalHref", () => {
  it("treats rooted app paths as internal", () => {
    expect(isInternalHref("/guide")).toBe(true);
    expect(isInternalHref("/settings?network=testnet")).toBe(true);
    expect(isInternalHref("#overview")).toBe(true);
  });

  it("treats protocols and protocol-relative URLs as external", () => {
    expect(isInternalHref("https://aptoslabs.com")).toBe(false);
    expect(isInternalHref("//cdn.example")).toBe(false);
  });
});
