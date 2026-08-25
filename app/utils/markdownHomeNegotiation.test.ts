import assert from "node:assert/strict";
import {describe, expect, it} from "vitest";
import {negotiateMarkdownRequest} from "./markdownHomeNegotiation";

describe("negotiateMarkdownRequest", () => {
  const sampleLlms = "# Aptos Explorer\n\nShort reference.\n";

  it("returns null for non-GET/HEAD", () => {
    const req = new Request("https://explorer.example/", {
      method: "POST",
      headers: {Accept: "text/markdown"},
    });
    expect(negotiateMarkdownRequest(req, sampleLlms)).toBeNull();
  });

  it("returns null when Accept does not prefer markdown", () => {
    const req = new Request("https://explorer.example/", {
      headers: {Accept: "text/html"},
    });
    expect(negotiateMarkdownRequest(req, sampleLlms)).toBeNull();
  });

  it("returns markdown Response for GET / with Accept: text/markdown", async () => {
    const req = new Request("https://explorer.example/", {
      headers: {Accept: "text/markdown"},
    });
    const res = negotiateMarkdownRequest(req, sampleLlms);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);
    expect(res?.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(res?.headers.get("Vary")).toBe("Accept");
    expect(res?.headers.get("X-Markdown-Source")).toBe("/llms.txt");
    expect(res?.headers.get("X-Markdown-Tokens")).toBe(
      String(Math.ceil(sampleLlms.length / 4)),
    );
    expect(res?.headers.get("Link")).toContain(
      '</.well-known/api-catalog>; rel="api-catalog"',
    );
    assert(res);
    expect(await res.text()).toBe(sampleLlms);
  });

  it("returns an empty body for HEAD / with Accept: text/markdown", async () => {
    const req = new Request("https://explorer.example/", {
      method: "HEAD",
      headers: {Accept: "text/markdown"},
    });
    const res = negotiateMarkdownRequest(req, sampleLlms);
    expect(res).not.toBeNull();
    assert(res);
    const text = await res.text();
    expect(text).toBe("");
  });

  it("treats /index.html like the homepage", () => {
    const req = new Request("https://explorer.example/index.html", {
      headers: {Accept: "text/markdown"},
    });
    const res = negotiateMarkdownRequest(req, sampleLlms);
    expect(res).not.toBeNull();
    expect(res?.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(res?.headers.get("X-Markdown-Source")).toBe("/llms.txt");
  });

  it("serves a path stub instead of 500 for non-home HTML routes", async () => {
    const req = new Request("https://explorer.example/txn/123", {
      headers: {Accept: "text/markdown"},
    });
    const res = negotiateMarkdownRequest(req, sampleLlms);
    expect(res).not.toBeNull();
    assert(res);
    expect(res.headers.get("X-Markdown-Source")).toBe("/txn/123");
    const text = await res.text();
    expect(text).toContain("# Aptos Explorer — /txn/123");
    expect(text).toContain("Transaction detail");
    expect(text).not.toBe(sampleLlms);
  });

  it("does not negotiate well-known JSON or hashed assets", () => {
    const wellKnown = new Request(
      "https://explorer.example/.well-known/agent-card.json",
      {headers: {Accept: "text/markdown"}},
    );
    expect(negotiateMarkdownRequest(wellKnown, sampleLlms)).toBeNull();

    const asset = new Request("https://explorer.example/assets/index-abc.js", {
      headers: {Accept: "text/markdown"},
    });
    expect(negotiateMarkdownRequest(asset, sampleLlms)).toBeNull();

    const vercelInsights = new Request(
      "https://explorer.example/_vercel/insights/view",
      {headers: {Accept: "text/markdown"}},
    );
    expect(negotiateMarkdownRequest(vercelInsights, sampleLlms)).toBeNull();
  });

  it("accepts a relative request URL without throwing", async () => {
    const req = {
      method: "GET",
      url: "/",
      headers: new Headers({Accept: "text/markdown"}),
    } as Request;
    const res = negotiateMarkdownRequest(req, sampleLlms);
    expect(res).not.toBeNull();
    assert(res);
    expect(await res.text()).toBe(sampleLlms);
  });
});
