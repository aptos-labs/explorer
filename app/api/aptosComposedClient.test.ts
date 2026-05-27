import {AptosConfig, Network} from "@aptos-labs/ts-sdk";
import {describe, expect, it} from "vitest";
import {createAptosComposedClient} from "./aptosComposedClient";

const config = new AptosConfig({network: Network.MAINNET});

describe("createAptosComposedClient", () => {
  it("exposes the config property", () => {
    const client = createAptosComposedClient(config);
    expect(client.config).toBe(config);
  });

  describe("namespace accessor properties", () => {
    it("exposes all nine namespace instances", () => {
      const client = createAptosComposedClient(config);
      expect(client.general).toBeDefined();
      expect(client.account).toBeDefined();
      expect(client.ans).toBeDefined();
      expect(client.coin).toBeDefined();
      expect(client.digitalAsset).toBeDefined();
      expect(client.fungibleAsset).toBeDefined();
      expect(client.staking).toBeDefined();
      expect(client.table).toBeDefined();
      expect(client.transaction).toBeDefined();
    });

    it("namespace instances carry the same config", () => {
      const client = createAptosComposedClient(config);
      expect(client.general.config).toBe(config);
      expect(client.transaction.config).toBe(config);
      expect(client.account.config).toBe(config);
    });
  });

  describe("flat prototype methods", () => {
    it("exposes General methods directly on the client", () => {
      const client = createAptosComposedClient(config);
      expect(typeof client.getLedgerInfo).toBe("function");
      expect(typeof client.getChainId).toBe("function");
      expect(typeof client.view).toBe("function");
    });

    it("exposes Transaction methods directly on the client", () => {
      const client = createAptosComposedClient(config);
      expect(typeof client.getTransactions).toBe("function");
      expect(typeof client.getTransactionByHash).toBe("function");
      expect(typeof client.waitForTransaction).toBe("function");
    });

    it("exposes Account methods directly on the client", () => {
      const client = createAptosComposedClient(config);
      expect(typeof client.getAccountInfo).toBe("function");
      expect(typeof client.getAccountResources).toBe("function");
    });
  });

  describe("Transaction sub-builders", () => {
    it("exposes build, simulate, submit, batch from the Transaction namespace", () => {
      const client = createAptosComposedClient(config);
      // These are eagerly-constructed instance properties on Transaction
      expect(client.transaction.build).toBeDefined();
      expect(client.transaction.simulate).toBeDefined();
      expect(client.transaction.submit).toBeDefined();
      expect(client.transaction.batch).toBeDefined();
    });

    it("sub-builder build.simple is callable (matches Aptos class shape used by Contract.tsx)", () => {
      const client = createAptosComposedClient(config);
      expect(typeof client.transaction.build.simple).toBe("function");
    });

    it("sub-builder simulate.simple is callable", () => {
      const client = createAptosComposedClient(config);
      expect(typeof client.transaction.simulate.simple).toBe("function");
    });
  });

  describe("Account sub-builders", () => {
    it("exposes abstraction from the Account namespace", () => {
      const client = createAptosComposedClient(config);
      expect(client.account.abstraction).toBeDefined();
    });
  });

  describe("method binding", () => {
    it("flat methods are bound to their respective namespace (not the composed object)", () => {
      const client = createAptosComposedClient(config);
      // Calling the flat method should not throw a 'this' binding error —
      // it should use the namespace instance as its receiver.
      // We can verify binding by extracting the method and calling it
      // (it will reject due to no network, but won't throw synchronously).
      const fn = client.getLedgerInfo;
      expect(fn).toBeInstanceOf(Function);
      // Destructured call should not throw synchronously (binding is preserved)
      expect(() => fn()).not.toThrow();
    });
  });

  describe("no duplicate or clobbered methods", () => {
    it("creates independent clients per call (no shared state)", () => {
      const config2 = new AptosConfig({network: Network.TESTNET});
      const client1 = createAptosComposedClient(config);
      const client2 = createAptosComposedClient(config2);
      expect(client1.config).not.toBe(client2.config);
      expect(client1.transaction).not.toBe(client2.transaction);
    });
  });
});
