import {describe, expect, it} from "vitest";
import {estimateMarkdownTokens, htmlToMarkdown} from "./htmlToMarkdown";

describe("htmlToMarkdown", () => {
  it("converts HTML responses into readable markdown", () => {
    // Covers FEAT-SEO-004.
    const markdown = htmlToMarkdown(
      `<!doctype html>
      <html>
        <head><title>Aptos Explorer</title><style>.hidden{display:none}</style></head>
        <body>
          <main>
            <h1>Explore Aptos</h1>
            <p>View <a href="/transactions">transactions</a> &amp; blocks.</p>
            <ul><li><strong>Mainnet</strong></li><li>Testnet</li></ul>
            <script>console.log("ignored")</script>
          </main>
        </body>
      </html>`,
      "https://explorer.aptoslabs.com/",
    );

    expect(markdown).toContain("# Aptos Explorer");
    expect(markdown).toContain("Source: https://explorer.aptoslabs.com/");
    expect(markdown).toContain("# Explore Aptos");
    expect(markdown).toContain("View [transactions](/transactions) & blocks.");
    expect(markdown).toContain("- Mainnet");
    expect(markdown).toContain("- Testnet");
    expect(markdown).not.toContain("console.log");
    expect(markdown).not.toContain("<main>");
  });

  it("estimates token count for the markdown response header", () => {
    // Covers FEAT-SEO-004.
    expect(estimateMarkdownTokens("")).toBe(0);
    expect(estimateMarkdownTokens("Aptos")).toBe(2);
  });
});
