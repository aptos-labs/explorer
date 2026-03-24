// Covers FEAT-ACCOUNT-005 — Account tab set computation
import {describe, expect, it} from "vitest";
import {getTabValues} from "./useAccountTabValues";

describe("FEAT-ACCOUNT-005 — getTabValues", () => {
  describe("standard account", () => {
    it("returns full tabs when GraphQL is supported", () => {
      const tabs = getTabValues(true, false, false);
      expect(tabs).toEqual([
        "transactions",
        "coins",
        "tokens",
        "resources",
        "modules",
        "info",
      ]);
    });

    it("returns reduced tabs when GraphQL is not supported", () => {
      const tabs = getTabValues(false, false, false);
      expect(tabs).toEqual(["transactions", "resources", "modules", "info"]);
    });
  });

  describe("multisig account", () => {
    it("includes multisig tab after transactions when GraphQL on", () => {
      const tabs = getTabValues(true, false, true);
      expect(tabs).toEqual([
        "transactions",
        "multisig",
        "coins",
        "tokens",
        "resources",
        "modules",
        "info",
      ]);
    });

    it("includes multisig tab when GraphQL off", () => {
      const tabs = getTabValues(false, false, true);
      expect(tabs).toEqual([
        "transactions",
        "multisig",
        "resources",
        "modules",
        "info",
      ]);
    });
  });

  describe("object account", () => {
    it("returns full object tabs when GraphQL on", () => {
      const tabs = getTabValues(true, true, false);
      expect(tabs).toEqual([
        "transactions",
        "coins",
        "tokens",
        "resources",
        "modules",
        "info",
      ]);
    });

    it("returns reduced object tabs when GraphQL off", () => {
      const tabs = getTabValues(false, true, false);
      expect(tabs).toEqual(["transactions", "resources", "modules", "info"]);
    });
  });

  describe("tab invariants", () => {
    it("always includes transactions as first tab", () => {
      for (const gql of [true, false]) {
        for (const obj of [true, false]) {
          for (const ms of [true, false]) {
            const tabs = getTabValues(gql, obj, ms);
            expect(tabs[0]).toBe("transactions");
          }
        }
      }
    });

    it("always includes info as last tab", () => {
      for (const gql of [true, false]) {
        for (const obj of [true, false]) {
          for (const ms of [true, false]) {
            const tabs = getTabValues(gql, obj, ms);
            expect(tabs[tabs.length - 1]).toBe("info");
          }
        }
      }
    });

    it("never includes coins or tokens without GraphQL", () => {
      for (const obj of [true, false]) {
        for (const ms of [true, false]) {
          const tabs = getTabValues(false, obj, ms);
          expect(tabs).not.toContain("coins");
          expect(tabs).not.toContain("tokens");
        }
      }
    });

    it("returns new array each call (no shared reference)", () => {
      const a = getTabValues(true, false, false);
      const b = getTabValues(true, false, false);
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });
});
