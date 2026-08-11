// Covers FEAT-TXN-009 — CCTP recipient address formatting
import {bech32} from "@scure/base";
import {describe, expect, it} from "vitest";
import {formatAptosCctpRecipient, formatCctpRecipient} from "./formatRecipient";

describe("FEAT-TXN-009 — formatCctpRecipient", () => {
  const vitalikEvmBytes32 =
    "0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045";

  it("formats EVM destination (Base domain 6) from left-padded bytes32", () => {
    const result = formatCctpRecipient(6, vitalikEvmBytes32);
    expect(result.display).toBe("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
    expect(result.chainName).toBe("Base");
  });

  it("formats Noble destination (domain 4) as bech32", () => {
    const nobleBech32 = "noble12l2w4ugfz4m6dd73yysz477jszqnfughxvkss5";
    const {words} = bech32.decode(nobleBech32);
    const addr20 = bech32.fromWords(words);
    const padded = new Uint8Array(32);
    padded.set(addr20, 12);
    const hex = `0x${Array.from(padded)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;

    const result = formatCctpRecipient(4, hex);
    expect(result.display).toBe(nobleBech32);
    expect(result.chainName).toBe("Noble");
  });

  it("formats Solana destination (domain 5) as base58", () => {
    const bytes = new Uint8Array(32);
    bytes[31] = 1;
    const hex = `0x${Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;

    const result = formatCctpRecipient(5, hex);
    expect(result.display.length).toBeGreaterThan(10);
    expect(result.chainName).toBe("Solana");
  });

  it("formats Sui destination (domain 8) as full 32-byte hex", () => {
    const suiAddr =
      "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc";
    const result = formatCctpRecipient(8, suiAddr);
    expect(result.display).toBe(suiAddr);
    expect(result.chainName).toBe("Sui");
  });

  it("formats Aptos destination (domain 9) with aptosAddress for HashButton", () => {
    const aptosAddr =
      "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc";
    const result = formatCctpRecipient(9, aptosAddr);
    expect(result.aptosAddress).toBe(aptosAddr);
    expect(result.chainName).toBe("Aptos");
  });

  it("falls back for unknown domain", () => {
    const result = formatCctpRecipient(99, vitalikEvmBytes32);
    expect(result.chainName).toBe("Domain 99");
    expect(result.display).toContain(
      "d8da6bf26964af9d7eed9e03e53415d37aa96045",
    );
  });
});

describe("formatAptosCctpRecipient", () => {
  it("standardizes inbound Aptos mint recipient", () => {
    const addr =
      "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc";
    const result = formatAptosCctpRecipient(addr);
    expect(result.aptosAddress).toBe(addr);
    expect(result.chainName).toBe("Aptos");
  });
});
