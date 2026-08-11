// Covers FEAT-TXN-009 — CCTP domain name and EVM recipient formatting
import {describe, expect, it} from "vitest";
import {getCctpDomainInfo, isEvmCctpDomain} from "./domains";
import {formatCctpRecipient} from "./formatRecipient";

describe("CCTP domains", () => {
  it("names Codex (domain 12)", () => {
    expect(getCctpDomainInfo(12).name).toBe("Codex");
    expect(isEvmCctpDomain(12)).toBe(true);
  });

  it("formats EVM recipient for Monad (domain 15)", () => {
    const vitalikEvmBytes32 =
      "0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045";
    const result = formatCctpRecipient(15, vitalikEvmBytes32);
    expect(result.chainName).toBe("Monad");
    expect(result.display).toBe("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
  });

  it("treats Starknet (domain 25) as full 32-byte hex, not EVM", () => {
    expect(isEvmCctpDomain(25)).toBe(false);
    const starknetBytes32 =
      "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const result = formatCctpRecipient(25, starknetBytes32);
    expect(result.chainName).toBe("Starknet");
    expect(result.display).toBe(starknetBytes32);
  });
});
