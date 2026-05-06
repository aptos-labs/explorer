import assert from "node:assert/strict";
import {describe, expect, it} from "vitest";
import {negotiateMarkdownHomepage} from "./markdownHomeNegotiation";

describe("negotiateMarkdownHomepage", () => {
  const sampleLlms = "# Aptos Explorer\n\nShort reference.\n";

  it("returns null for non-GET/HEAD", () => {
    const req = new Request("https://explorer.example/", {
      method: "POST",
      headers: {Accept: "text/markdown"},
    });
    expect(negotiateMarkdownHomepage(req, sampleLlms)).toBeNull();
  });

  it("returns null when Accept does not prefer markdown", () => {
    const req = new Request("https://explorer.example/", {
      headers: {Accept: "text/html"},
    });
    expect(negotiateMarkdownHomepage(req, sampleLlms)).toBeNull();
  });

  it("returns null for markdown Accept on non-home paths", () => {
    const req = new Request("https://explorer.example/account/0x1", {
      headers: {Accept: "text/markdown"},
    });
    expect(negotiateMarkdownHomepage(req, sampleLlms)).toBeNull();
  });

  it("returns markdown Response for GET / with Accept: text/markdown", () => {
    const req = new Request("https://explorer.example/", {
      headers: {Accept: "text/markdown"},
    });
    const res = negotiateMarkdownHomepage(req, sampleLlms);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);
    expect(res?.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(res?.headers.get("Vary")).toBe("Accept");
    expect(res?.headers.get("X-Markdown-Source")).toBe("/llms.txt");
    expect(res?.headers.get("Link")).toContain(
      '</.well-known/api-catalog>; rel="api-catalog"',
    );
  });

  it("returns an empty body for HEAD / with Accept: text/markdown", async () => {
    const req = new Request("https://explorer.example/", {
      method: "HEAD",
      headers: {Accept: "text/markdown"},
    });
    const res = negotiateMarkdownHomepage(req, sampleLlms);
    expect(res).not.toBeNull();
    assert(res);
    const text = await res.text();
    expect(text).toBe("");
  });

  it("treats /index.html like the homepage", () => {
    const req = new Request("https://explorer.example/index.html", {
      headers: {Accept: "text/markdown"},
    });
    const res = negotiateMarkdownHomepage(req, sampleLlms);
    expect(res).not.toBeNull();
    expect(res?.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
  });
});
