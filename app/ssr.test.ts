import {describe, expect, it} from "vitest";
import serverEntry from "./ssr";

describe("TanStack Start SSR entry", () => {
  it("exports a fetch handler object for Netlify's Vite adapter", () => {
    // Covers FEAT-SEO-004: SSR-hosted markdown negotiation must deploy through Netlify's server entry contract.
    expect(typeof serverEntry.fetch).toBe("function");
  });

  it("serves llms.txt markdown before TanStack enforces HTML-only SSR", async () => {
    // Covers FEAT-SEO-004: markdown negotiation runs in SSR without a Netlify Edge Function.
    const response = await serverEntry.fetch(
      new Request("https://explorer.aptoslabs.com/", {
        headers: {accept: "text/markdown"},
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("x-markdown-source")).toBe("/llms.txt");
  });
});
