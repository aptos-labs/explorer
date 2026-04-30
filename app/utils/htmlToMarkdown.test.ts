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

  it("escapes angle brackets from text content", () => {
    // Covers FEAT-SEO-004.
    const markdown = htmlToMarkdown(
      `<html><body><p>&lt;script&gt;alert("xss")&lt;/script&gt;</p></body></html>`,
    );

    expect(markdown).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    expect(markdown).not.toContain("<script>");
  });

  it("only emits markdown links and images for safe URL schemes", () => {
    // Covers FEAT-SEO-004.
    const markdown = htmlToMarkdown(
      `<html><body>
        <a href="https://explorer.aptoslabs.com/txn/1">Transaction</a>
        <a href="/account/0x1">Account</a>
        <a href="javascript:alert(1)">Script link</a>
        <a href="data:text/html,alert(1)">Data link</a>
        <img src="https://example.com/logo.png" alt="Logo">
        <img src="vbscript:alert(1)" alt="Bad image">
      </body></html>`,
    );

    expect(markdown).toContain(
      "[Transaction](https://explorer.aptoslabs.com/txn/1)",
    );
    expect(markdown).toContain("[Account](/account/0x1)");
    expect(markdown).toContain("Script link");
    expect(markdown).toContain("Data link");
    expect(markdown).toContain("![Logo](https://example.com/logo.png)");
    expect(markdown).not.toContain("javascript:");
    expect(markdown).not.toContain("data:text/html");
    expect(markdown).not.toContain("vbscript:");
    expect(markdown).not.toContain("Bad image");
  });

  it("estimates token count for the markdown response header", () => {
    // Covers FEAT-SEO-004.
    expect(estimateMarkdownTokens("")).toBe(0);
    expect(estimateMarkdownTokens("Aptos")).toBe(2);
  });
});
