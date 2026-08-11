import {Hex} from "@aptos-labs/ts-sdk";
import {base58, bech32} from "@scure/base";
import {standardizeAddress, tryStandardizeAddress} from "../../../utils";
import {getCctpDomainInfo, isEvmCctpDomain} from "./domains";

export type FormattedCctpRecipient = {
  display: string;
  /** Set when the recipient is an Aptos account (domain 9 or inbound on Aptos). */
  aptosAddress?: string;
  chainName: string;
};

function mintRecipientToBytes(mintRecipient: string): Uint8Array | undefined {
  const trimmed = mintRecipient.trim();
  if (!trimmed) return undefined;

  try {
    const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
    const bytes = Hex.fromHexString(hex).toUint8Array();
    if (bytes.length === 0) return undefined;
    if (bytes.length < 32) {
      const padded = new Uint8Array(32);
      padded.set(bytes, 32 - bytes.length);
      return padded;
    }
    if (bytes.length > 32) return bytes.slice(-32);
    return bytes;
  } catch {
    return undefined;
  }
}

function bytesToHexLower(bytes: Uint8Array): string {
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

function formatEvmAddress(bytes32: Uint8Array): string {
  const addr20 = bytes32.slice(-20);
  return bytesToHexLower(addr20);
}

function formatNobleAddress(bytes32: Uint8Array): string {
  const addr20 = bytes32.slice(-20);
  return bech32.encode("noble", bech32.toWords(addr20));
}

function formatSolanaAddress(bytes32: Uint8Array): string {
  return base58.encode(bytes32);
}

function formatMoveAddress(bytes32: Uint8Array): string {
  const standardized = tryStandardizeAddress(bytesToHexLower(bytes32));
  return standardized ?? bytesToHexLower(bytes32);
}

/**
 * Format a CCTP mint_recipient for display based on destination domain.
 * Covers EVM, Noble (bech32), Solana (base58), Sui, and Aptos (32-byte hex).
 */
export function formatCctpRecipient(
  destinationDomain: number,
  mintRecipient: string,
): FormattedCctpRecipient {
  const chainName = getCctpDomainInfo(destinationDomain).name;
  const bytes = mintRecipientToBytes(mintRecipient);

  if (!bytes) {
    return {
      display: mintRecipient,
      chainName,
    };
  }

  if (destinationDomain === 9) {
    const aptosAddress = formatMoveAddress(bytes);
    return {
      display: aptosAddress,
      aptosAddress: standardizeAddress(aptosAddress),
      chainName,
    };
  }

  if (destinationDomain === 8 || destinationDomain === 25) {
    const display = formatMoveAddress(bytes);
    return {display, chainName};
  }

  if (destinationDomain === 5) {
    const display = formatSolanaAddress(bytes);
    return {display, chainName};
  }

  if (destinationDomain === 4) {
    const display = formatNobleAddress(bytes);
    return {display, chainName};
  }

  if (isEvmCctpDomain(destinationDomain)) {
    const display = formatEvmAddress(bytes);
    return {display, chainName};
  }

  const display = bytesToHexLower(bytes);
  return {display, chainName};
}

/** Format mint recipient on Aptos (inbound CCTP mint). */
export function formatAptosCctpRecipient(
  mintRecipient: string,
): FormattedCctpRecipient {
  const standardized = tryStandardizeAddress(mintRecipient);
  if (standardized) {
    return {
      display: standardized,
      aptosAddress: standardized,
      chainName: "Aptos",
    };
  }
  return {
    display: mintRecipient,
    chainName: "Aptos",
  };
}
