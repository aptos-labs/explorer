import {describe, expect, it} from "vitest";
import {prefersMarkdown} from "./acceptMarkdown";

describe("prefersMarkdown", () => {
  it("returns false for null / empty Accept", () => {
    expect(prefersMarkdown(null)).toBe(false);
    expect(prefersMarkdown("")).toBe(false);
    expect(prefersMarkdown(undefined)).toBe(false);
  });

  it("returns false for a typical browser Accept", () => {
    expect(
      prefersMarkdown(
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      ),
    ).toBe(false);
  });

  it("returns true for exact text/markdown", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
  });

  it("returns true when text/markdown appears with other types", () => {
    expect(prefersMarkdown("text/markdown, text/html;q=0.8, */*;q=0.1")).toBe(
      true,
    );
  });

  it("returns true for text/markdown with explicit q=1", () => {
    expect(prefersMarkdown("text/markdown;q=1.0")).toBe(true);
  });

  it("returns false when text/markdown is explicitly disabled via q=0", () => {
    expect(prefersMarkdown("text/markdown;q=0, text/html")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(prefersMarkdown("TEXT/MARKDOWN")).toBe(true);
  });

  it("ignores unrelated text/* types", () => {
    expect(prefersMarkdown("text/plain, text/html")).toBe(false);
  });

  it("rejects media types that merely start with 'text/markdown'", () => {
    // Defensive: ensure we don't match a hypothetical "text/markdown-foo"
    // media range. The parser must compare the full media type, not a
    // prefix.
    expect(prefersMarkdown("text/markdown-foo")).toBe(false);
    expect(prefersMarkdown("text/markdown2")).toBe(false);
  });
});
