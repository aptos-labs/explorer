import {describe, expect, it} from "vitest";
import {
  attachAgentDiscoveryHeaders,
  DISCOVERY_LINK_HEADER,
  DISCOVERY_LINK_VALUES,
  getRequestOrigin,
  getRequestPathname,
} from "./agentDiscoveryHeaders";

describe("agent discovery headers", () => {
  it("includes RFC 8288 relations scanners look for", () => {
    // Covers FEAT-SEO-004.
    const header = DISCOVERY_LINK_HEADER;
    expect(header).toContain('rel="api-catalog"');
    expect(header).toContain('rel="service-desc"');
    expect(header).toContain("agent-card.json");
    expect(header).toContain("oauth-protected-resource");
    expect(header).toContain("/auth.md");
    expect(DISCOVERY_LINK_VALUES.length).toBeGreaterThanOrEqual(8);
  });

  it("adds Link and Vary: Accept when they are missing", () => {
    const response = attachAgentDiscoveryHeaders(
      new Response("ok", {headers: {"Content-Type": "text/html"}}),
    );
    expect(response.headers.get("Link")).toBe(DISCOVERY_LINK_HEADER);
    expect(response.headers.get("Vary")).toBe("Accept");
  });

  it("appends Accept to an existing Vary list", () => {
    const response = attachAgentDiscoveryHeaders(
      new Response("ok", {headers: {Vary: "Accept-Encoding"}}),
    );
    expect(response.headers.get("Vary")).toBe("Accept-Encoding, Accept");
    expect(response.headers.get("Link")).toBe(DISCOVERY_LINK_HEADER);
  });

  it("does not replace an existing Link header", () => {
    const response = attachAgentDiscoveryHeaders(
      new Response("ok", {headers: {Link: '</llms.txt>; rel="alternate"'}}),
    );
    expect(response.headers.get("Link")).toBe('</llms.txt>; rel="alternate"');
  });

  it("parses pathnames from absolute and relative request URLs", () => {
    expect(
      getRequestPathname(new Request("https://explorer.aptoslabs.com/txn/1")),
    ).toBe("/txn/1");
    expect(getRequestPathname({url: "/account/0x1"} as Request)).toBe(
      "/account/0x1",
    );
  });

  it("falls back to the production origin for relative request URLs", () => {
    expect(getRequestOrigin({url: "/"} as Request)).toBe(
      "https://explorer.aptoslabs.com",
    );
    expect(getRequestOrigin(new Request("https://preview.example/"))).toBe(
      "https://preview.example",
    );
  });
});
