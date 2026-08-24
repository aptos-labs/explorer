import {describe, expect, it} from "vitest";
import {isSpaIndexHtmlOutput, SPA_INDEX_HTML_FILES} from "./omitSpaIndexHtml";

describe("isSpaIndexHtmlOutput", () => {
  // Covers FEAT-SEO-004 — production must not publish the Vite SPA shell
  it("matches the SPA index document and compressed copies", () => {
    expect(SPA_INDEX_HTML_FILES).toEqual([
      "index.html",
      "index.html.gz",
      "index.html.br",
    ]);
    expect(isSpaIndexHtmlOutput("index.html")).toBe(true);
    expect(isSpaIndexHtmlOutput("index.html.gz")).toBe(true);
    expect(isSpaIndexHtmlOutput("index.html.br")).toBe(true);
    expect(isSpaIndexHtmlOutput("assets/index.html")).toBe(true);
  });

  it("does not match hashed client assets or other HTML", () => {
    expect(isSpaIndexHtmlOutput("assets/client-abc123.js")).toBe(false);
    expect(isSpaIndexHtmlOutput("404.html")).toBe(false);
    expect(isSpaIndexHtmlOutput("index.htm")).toBe(false);
  });
});
