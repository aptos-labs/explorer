// Covers FEAT-TELEMETRY-002 — Vercel Web Analytics URL redaction
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {
  redactVercelAnalyticsUrl,
  sanitizeVercelAnalyticsPathname,
  vercelAnalyticsBeforeSend,
} from "./vercelAnalytics";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

describe("FEAT-TELEMETRY-002 — sanitizeVercelAnalyticsPathname", () => {
  it("leaves static hubs unchanged", () => {
    expect(sanitizeVercelAnalyticsPathname("/")).toBe("/");
    expect(sanitizeVercelAnalyticsPathname("/analytics")).toBe("/analytics");
    expect(sanitizeVercelAnalyticsPathname("/transactions")).toBe(
      "/transactions",
    );
    expect(sanitizeVercelAnalyticsPathname("/validators/delegation")).toBe(
      "/validators/delegation",
    );
    expect(sanitizeVercelAnalyticsPathname("/releases/networks")).toBe(
      "/releases/networks",
    );
  });

  it("replaces entity identifiers with route-template params", () => {
    expect(sanitizeVercelAnalyticsPathname("/account/0x1")).toBe(
      "/account/$address",
    );
    expect(sanitizeVercelAnalyticsPathname("/account/0x1/transactions")).toBe(
      "/account/$address/transactions",
    );
    expect(
      sanitizeVercelAnalyticsPathname("/account/alice.apt/modules/code/coin"),
    ).toBe("/account/$address/modules/code/coin");
    expect(sanitizeVercelAnalyticsPathname("/txn/123456789")).toBe(
      "/txn/$txnHashOrVersion",
    );
    expect(sanitizeVercelAnalyticsPathname("/txn/0xabc/events")).toBe(
      "/txn/$txnHashOrVersion/events",
    );
    expect(sanitizeVercelAnalyticsPathname("/block/42/overview")).toBe(
      "/block/$height/overview",
    );
    expect(sanitizeVercelAnalyticsPathname("/validator/0xaa")).toBe(
      "/validator/$address",
    );
    expect(
      sanitizeVercelAnalyticsPathname("/coin/0x1::aptos_coin::AptosCoin/info"),
    ).toBe("/coin/$struct/info");
    expect(
      sanitizeVercelAnalyticsPathname("/fungible_asset/0xbb/holders"),
    ).toBe("/fungible_asset/$address/holders");
    expect(sanitizeVercelAnalyticsPathname("/token/0xcc/overview")).toBe(
      "/token/$tokenId/overview",
    );
    expect(sanitizeVercelAnalyticsPathname("/object/0xdd/resources")).toBe(
      "/object/$address/resources",
    );
  });
});

describe("FEAT-TELEMETRY-002 — redactVercelAnalyticsUrl", () => {
  it("keeps only the network query param", () => {
    expect(
      redactVercelAnalyticsUrl(
        "https://explorer.aptoslabs.com/account/0x1/transactions?network=testnet&page=2&search=secret",
      ),
    ).toBe(
      "https://explorer.aptoslabs.com/account/$address/transactions?network=testnet",
    );
  });

  it("drops hashes and other query params on static routes", () => {
    expect(
      redactVercelAnalyticsUrl(
        "https://explorer.aptoslabs.com/?search=0xabc#main-content",
      ),
    ).toBe("https://explorer.aptoslabs.com/");
  });

  it("parses relative URLs against the explorer origin", () => {
    expect(redactVercelAnalyticsUrl("/txn/99?network=mainnet")).toBe(
      "https://explorer.aptoslabs.com/txn/$txnHashOrVersion?network=mainnet",
    );
  });
});

describe("FEAT-TELEMETRY-002 — vercelAnalyticsBeforeSend", () => {
  it("rewrites event.url and preserves other fields", () => {
    const event = {
      type: "pageview" as const,
      url: "https://explorer.aptoslabs.com/txn/0xdead?fn_name=transfer",
    };
    expect(vercelAnalyticsBeforeSend(event)).toEqual({
      type: "pageview",
      url: "https://explorer.aptoslabs.com/txn/$txnHashOrVersion",
    });
  });
});

describe("FEAT-TELEMETRY-002 — mount site", () => {
  it("mounts VercelAnalytics from the root route", () => {
    const root = readFileSync(join(repoRoot, "app/routes/__root.tsx"), "utf8");
    expect(root).toContain("<VercelAnalytics />");
  });

  it("does not cache Vercel insights endpoints in the service worker", () => {
    const sw = readFileSync(join(repoRoot, "public/sw.js"), "utf8");
    expect(sw).toContain('url.pathname.startsWith("/_vercel/")');
    expect(sw).toContain('url.hostname === "va.vercel-scripts.com"');
  });
});
