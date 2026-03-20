import {describe, expect, it} from "vitest";
import {BASE_URL} from "../../lib/constants";
import {generateStructuredData} from "./usePageMetadata";

describe("generateStructuredData", () => {
  it("emits Article for type article", () => {
    const canonical = `${BASE_URL}/verification`;
    const fullTitle = "Token & Address Verification | Aptos Explorer";
    const items = generateStructuredData(
      {
        type: "article",
        title: "Token & Address Verification",
        description: "How to verify tokens on Aptos.",
      },
      fullTitle,
      canonical,
    );
    const article = items.find((x) => x["@type"] === "Article");
    expect(article).toBeDefined();
    expect(article?.headline).toBe(fullTitle);
    expect(article?.url).toBe(canonical);
    expect(article?.author).toMatchObject({
      "@type": "Organization",
      name: "Aptos Labs",
    });
    expect(article?.publisher).toMatchObject({
      "@type": "Organization",
      name: "Aptos Labs",
    });
  });

  it("adds WebPage.about for home when searchQuery is set", () => {
    const canonical = `${BASE_URL}/`;
    const items = generateStructuredData(
      {
        type: "website",
        title: "Search · 0x1",
        description: "Search description",
        searchQuery: "0x1",
      },
      "Search · 0x1 | Aptos Explorer",
      canonical,
    );
    const webPage = items.find((x) => x["@type"] === "WebPage");
    expect(webPage?.about).toEqual({
      "@type": "Thing",
      name: "Aptos Explorer search",
      description: "0x1",
    });
  });

  it("does not set WebPage.about when searchQuery is only whitespace", () => {
    const items = generateStructuredData(
      {type: "website", searchQuery: "   "},
      "Home | Aptos Explorer",
      `${BASE_URL}/`,
    );
    const webPage = items.find((x) => x["@type"] === "WebPage");
    expect(webPage?.about).toBeUndefined();
  });

  it("does not set WebPage.about for non-home paths", () => {
    const items = generateStructuredData(
      {type: "website", searchQuery: "foo"},
      "List | Aptos Explorer",
      `${BASE_URL}/transactions`,
    );
    const webPage = items.find((x) => x["@type"] === "WebPage");
    expect(webPage?.about).toBeUndefined();
  });

  it("includes DigitalDocument with identifier for transaction pages", () => {
    const canonical = `${BASE_URL}/txn/123/events`;
    const items = generateStructuredData(
      {type: "transaction", description: "A transaction"},
      "Transaction | Aptos Explorer",
      canonical,
    );
    const doc = items.find((x) => x["@type"] === "DigitalDocument");
    expect(doc?.identifier).toBe("123");
  });

  it("decodes coin type in FinancialProduct identifier", () => {
    const encoded = encodeURIComponent("0x1::aptos_coin::AptosCoin");
    const canonical = `${BASE_URL}/coin/${encoded}/info`;
    const items = generateStructuredData(
      {type: "coin", description: "APT coin"},
      "Coin | Aptos Explorer",
      canonical,
    );
    const fp = items.find((x) => x["@type"] === "FinancialProduct");
    expect(fp?.identifier).toBe("0x1::aptos_coin::AptosCoin");
  });

  it("adds CollectionPage for analytics list hub", () => {
    const canonical = `${BASE_URL}/analytics`;
    const items = generateStructuredData(
      {type: "website", description: "Network metrics"},
      "Network Analytics | Aptos Explorer",
      canonical,
    );
    const col = items.find((x) => x["@type"] === "CollectionPage");
    expect(col?.name).toBe("Network Analytics");
  });

  it("serializes every node to valid JSON", () => {
    const items = generateStructuredData(
      {
        type: "article",
        description: 'Text with "quotes" and <tags>',
      },
      'Article | "Site"',
      `${BASE_URL}/verification`,
    );
    for (const node of items) {
      expect(() => JSON.stringify(node)).not.toThrow();
      expect(JSON.parse(JSON.stringify(node))).toBeTruthy();
    }
  });
});
