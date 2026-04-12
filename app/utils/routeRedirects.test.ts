// Covers FEAT-ACCOUNT-012, FEAT-TXN-008, FEAT-BLOCK-002, FEAT-COIN-006,
// FEAT-FA-004, FEAT-TOKEN-005, FEAT-TOKEN-004, FEAT-VALIDATORS-006,
// FEAT-ROUTING-002, FEAT-WALLET-002, FEAT-ACCOUNT-002 (DeFi links),
// FEAT-SEARCH-001 (header search navigation)
import {describe, expect, it} from "vitest";
import {
  getPortfolioUrl,
  resolveEntityRedirect,
  resolveHeaderSearchNavigation,
  resolveTokenLegacyRedirect,
  resolveValidatorsEnhancedRedirect,
  resolveValidatorsRedirect,
  shouldBlockWalletSubmission,
} from "./routeRedirects";

describe("FEAT-ACCOUNT-012 / FEAT-ROUTING-002 — resolveEntityRedirect", () => {
  describe("account defaults", () => {
    it("redirects to default tab on exact /account/0x1 path", () => {
      const result = resolveEntityRedirect("/account/0x1", {}, "transactions");
      expect(result).toEqual({
        kind: "default",
        tab: "transactions",
        search: {},
      });
    });

    it("preserves network param on default redirect", () => {
      const result = resolveEntityRedirect(
        "/account/0x1",
        {network: "testnet"},
        "transactions",
      );
      expect(result).toEqual({
        kind: "default",
        tab: "transactions",
        search: {network: "testnet"},
      });
    });
  });

  describe("?tab= query param redirect", () => {
    it("redirects to specified tab", () => {
      const result = resolveEntityRedirect(
        "/account/0x1",
        {tab: "resources"},
        "transactions",
      );
      expect(result.kind).toBe("tab");
      if (result.kind === "tab") {
        expect(result.tab).toBe("resources");
      }
    });

    it("preserves modulesTab and network", () => {
      const result = resolveEntityRedirect(
        "/account/0x1",
        {tab: "modules", modulesTab: "code", network: "mainnet"},
        "transactions",
      );
      if (result.kind === "tab") {
        expect(result.search).toEqual({
          modulesTab: "code",
          network: "mainnet",
        });
      }
    });

    it("works even when not on exact path", () => {
      const result = resolveEntityRedirect(
        "/account/0x1/something",
        {tab: "info"},
        "transactions",
      );
      expect(result.kind).toBe("tab");
    });
  });

  describe("?modulesTab= redirect", () => {
    it("redirects to modules tab on exact path", () => {
      const result = resolveEntityRedirect(
        "/account/0x1",
        {modulesTab: "code"},
        "transactions",
      );
      expect(result.kind).toBe("modules");
      if (result.kind === "modules") {
        expect(result.search).toEqual({modulesTab: "code"});
      }
    });

    it("does not redirect modulesTab if not exact path", () => {
      const result = resolveEntityRedirect(
        "/account/0x1/transactions",
        {modulesTab: "code"},
        "transactions",
      );
      expect(result.kind).toBe("none");
    });
  });

  describe("non-exact paths", () => {
    it("returns none when already on a sub-route", () => {
      const result = resolveEntityRedirect(
        "/account/0x1/transactions",
        {},
        "transactions",
      );
      expect(result.kind).toBe("none");
    });
  });

  describe("different entity default tabs", () => {
    it("txn defaults to userTxnOverview", () => {
      const result = resolveEntityRedirect("/txn/0xabc", {}, "userTxnOverview");
      expect(result).toEqual({
        kind: "default",
        tab: "userTxnOverview",
        search: {},
      });
    });

    it("block defaults to overview", () => {
      const result = resolveEntityRedirect("/block/123", {}, "overview");
      expect(result).toEqual({
        kind: "default",
        tab: "overview",
        search: {},
      });
    });

    it("coin defaults to info", () => {
      const result = resolveEntityRedirect(
        "/coin/0x1::aptos_coin::AptosCoin",
        {},
        "info",
      );
      expect(result).toEqual({kind: "default", tab: "info", search: {}});
    });

    it("fungible_asset defaults to info", () => {
      const result = resolveEntityRedirect("/fungible_asset/0x1", {}, "info");
      expect(result).toEqual({kind: "default", tab: "info", search: {}});
    });

    it("token defaults to overview", () => {
      const result = resolveEntityRedirect("/token/0x1", {}, "overview");
      expect(result).toEqual({
        kind: "default",
        tab: "overview",
        search: {},
      });
    });
  });
});

describe("FEAT-TOKEN-004 — resolveTokenLegacyRedirect", () => {
  it("redirects numeric tab to overview with propertyVersion", () => {
    const result = resolveTokenLegacyRedirect("5", "mainnet");
    expect(result).toEqual({
      kind: "legacy",
      propertyVersion: "5",
      network: "mainnet",
    });
  });

  it("omits propertyVersion for '0'", () => {
    const result = resolveTokenLegacyRedirect("0");
    expect(result).toEqual({
      kind: "legacy",
      propertyVersion: undefined,
      network: undefined,
    });
  });

  it("returns null for valid tab names", () => {
    expect(resolveTokenLegacyRedirect("overview")).toBeNull();
    expect(resolveTokenLegacyRedirect("activities")).toBeNull();
  });

  it("returns null for non-numeric text", () => {
    expect(resolveTokenLegacyRedirect("abc")).toBeNull();
  });
});

describe("FEAT-VALIDATORS-006 — resolveValidatorsRedirect", () => {
  it("redirects exact /validators to all", () => {
    const result = resolveValidatorsRedirect("/validators", {});
    expect(result).toEqual({kind: "redirect", tab: "all", network: undefined});
  });

  it("redirects ?tab= to specified tab", () => {
    const result = resolveValidatorsRedirect("/validators", {
      tab: "delegation",
    });
    expect(result).toEqual({
      kind: "redirect",
      tab: "delegation",
      network: undefined,
    });
  });

  it("preserves network", () => {
    const result = resolveValidatorsRedirect("/validators", {
      network: "testnet",
    });
    expect(result).toEqual({
      kind: "redirect",
      tab: "all",
      network: "testnet",
    });
  });

  it("returns none when already on a sub-route", () => {
    const result = resolveValidatorsRedirect("/validators/all", {});
    expect(result.kind).toBe("none");
  });
});

describe("FEAT-VALIDATORS-006 — resolveValidatorsEnhancedRedirect", () => {
  it("defaults to all when no tab", () => {
    expect(resolveValidatorsEnhancedRedirect()).toEqual({
      tab: "all",
      network: undefined,
    });
  });

  it("preserves specified tab", () => {
    expect(resolveValidatorsEnhancedRedirect("delegation", "mainnet")).toEqual({
      tab: "delegation",
      network: "mainnet",
    });
  });
});

describe("FEAT-SEARCH-001 — resolveHeaderSearchNavigation", () => {
  it("routes 64-char hex to txn", () => {
    const hash = `0x${"a".repeat(64)}`;
    expect(resolveHeaderSearchNavigation(hash)).toEqual({
      kind: "txn",
      value: hash,
    });
  });

  it("routes numeric input to txn", () => {
    expect(resolveHeaderSearchNavigation("12345")).toEqual({
      kind: "txn",
      value: "12345",
    });
  });

  it("routes short hex to account", () => {
    expect(resolveHeaderSearchNavigation("0x1")).toEqual({
      kind: "account",
      value: "0x1",
    });
  });

  it("routes ANS-like input to account", () => {
    expect(resolveHeaderSearchNavigation("alice.apt")).toEqual({
      kind: "account",
      value: "alice.apt",
    });
  });

  it("routes arbitrary text to account", () => {
    expect(resolveHeaderSearchNavigation("hello")).toEqual({
      kind: "account",
      value: "hello",
    });
  });
});

describe("FEAT-WALLET-002 — shouldBlockWalletSubmission", () => {
  it("blocks when wallet network does not match explorer", () => {
    expect(shouldBlockWalletSubmission("testnet", "mainnet", "Petra")).toBe(
      true,
    );
  });

  it("allows when networks match", () => {
    expect(shouldBlockWalletSubmission("mainnet", "mainnet", "Petra")).toBe(
      false,
    );
  });

  it("allows case-insensitive match", () => {
    expect(shouldBlockWalletSubmission("Mainnet", "mainnet", "Petra")).toBe(
      false,
    );
    expect(shouldBlockWalletSubmission("mainnet", "Mainnet", "Petra")).toBe(
      false,
    );
  });

  it("never blocks Google AptosConnect", () => {
    expect(
      shouldBlockWalletSubmission(
        "testnet",
        "mainnet",
        "Google (AptosConnect)",
      ),
    ).toBe(false);
  });

  it("blocks when wallet network is undefined", () => {
    expect(shouldBlockWalletSubmission(undefined, "mainnet", "Petra")).toBe(
      true,
    );
  });

  it("allows non-Petra custom + loopback URL when explorer is local", () => {
    expect(
      shouldBlockWalletSubmission(
        "custom",
        "local",
        "Nightly",
        "http://127.0.0.1:8080/v1",
      ),
    ).toBe(false);
  });

  it("still blocks Petra custom even with loopback URL", () => {
    expect(
      shouldBlockWalletSubmission(
        "custom",
        "local",
        "Petra",
        "http://127.0.0.1:8080/v1",
      ),
    ).toBe(true);
  });

  it("blocks non-Petra custom when URL is not loopback", () => {
    expect(
      shouldBlockWalletSubmission(
        "custom",
        "local",
        "Nightly",
        "https://api.testnet.staging.aptoslabs.com/v1",
      ),
    ).toBe(true);
  });
});

describe("FEAT-ACCOUNT-002 — getPortfolioUrl", () => {
  const addr = "0x1234";

  it("builds Lightscan URL", () => {
    expect(getPortfolioUrl("lightscan", addr)).toBe(
      "https://aptos.lightscan.one/portfolio/0x1234",
    );
  });

  it("builds Yield AI URL", () => {
    expect(getPortfolioUrl("yieldai", addr)).toBe(
      "https://yieldai.app/portfolio/0x1234",
    );
  });
});
