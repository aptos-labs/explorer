// Covers FEAT-WALLET-002 (custom + loopback alignment for non-Petra wallets)
import {describe, expect, it} from "vitest";
import {
  allowsCustomNetworkForLocalExplorer,
  isLoopbackHostname,
  isLoopbackRpcUrl,
} from "./walletNetwork";

describe("isLoopbackHostname", () => {
  it("accepts localhost", () => {
    expect(isLoopbackHostname("localhost")).toBe(true);
    expect(isLoopbackHostname("LOCALHOST")).toBe(true);
  });

  it("accepts 127.0.0.1 and other 127.x", () => {
    expect(isLoopbackHostname("127.0.0.1")).toBe(true);
    expect(isLoopbackHostname("127.255.255.255")).toBe(true);
  });

  it("rejects non-loopback IPv4", () => {
    expect(isLoopbackHostname("128.0.0.1")).toBe(false);
    expect(isLoopbackHostname("10.0.0.1")).toBe(false);
  });

  it("accepts IPv6 loopback textual forms", () => {
    expect(isLoopbackHostname("::1")).toBe(true);
    expect(isLoopbackHostname("0:0:0:0:0:0:0:1")).toBe(true);
  });
});

describe("isLoopbackRpcUrl", () => {
  it("parses http URLs", () => {
    expect(isLoopbackRpcUrl("http://127.0.0.1:8080/v1")).toBe(true);
    expect(isLoopbackRpcUrl("http://localhost:8080/v1")).toBe(true);
  });

  it("rejects non-http(s) schemes even when hostname is loopback", () => {
    expect(isLoopbackRpcUrl("file://localhost/etc/passwd")).toBe(false);
    expect(isLoopbackRpcUrl("ws://127.0.0.1:8080/v1")).toBe(false);
  });

  it("returns false for empty or invalid", () => {
    expect(isLoopbackRpcUrl(undefined)).toBe(false);
    expect(isLoopbackRpcUrl("")).toBe(false);
    expect(isLoopbackRpcUrl("not-a-url")).toBe(false);
  });
});

describe("allowsCustomNetworkForLocalExplorer", () => {
  it("allows custom + loopback for non-Petra when explorer is local", () => {
    expect(
      allowsCustomNetworkForLocalExplorer(
        "Nightly",
        "custom",
        "http://127.0.0.1:8080/v1",
        "local",
      ),
    ).toBe(true);
  });

  it("disallows for Petra", () => {
    expect(
      allowsCustomNetworkForLocalExplorer(
        "Petra",
        "custom",
        "http://127.0.0.1:8080/v1",
        "local",
      ),
    ).toBe(false);
  });

  it("disallows when explorer is not local", () => {
    expect(
      allowsCustomNetworkForLocalExplorer(
        "Nightly",
        "custom",
        "http://127.0.0.1:8080/v1",
        "mainnet",
      ),
    ).toBe(false);
  });

  it("disallows when wallet URL is not loopback", () => {
    expect(
      allowsCustomNetworkForLocalExplorer(
        "Nightly",
        "custom",
        "https://api.testnet.staging.aptoslabs.com/v1",
        "local",
      ),
    ).toBe(false);
  });
});
