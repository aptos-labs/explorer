/** Circle CCTP domain identifiers (not EIP-155 chain IDs). */

export type CctpDomainInfo = {
  name: string;
};

/**
 * Domain table from Circle CCTP docs.
 * @see https://developers.circle.com/cctp/cctp-supported-blockchains
 */
const CCTP_DOMAINS: Record<number, CctpDomainInfo> = {
  0: {name: "Ethereum"},
  1: {name: "Avalanche"},
  2: {name: "OP Mainnet"},
  3: {name: "Arbitrum"},
  4: {name: "Noble"},
  5: {name: "Solana"},
  6: {name: "Base"},
  7: {name: "Polygon PoS"},
  8: {name: "Sui"},
  9: {name: "Aptos"},
  10: {name: "Unichain"},
  11: {name: "Linea"},
  12: {name: "Codex"},
  13: {name: "Sonic"},
  14: {name: "World Chain"},
  15: {name: "Monad"},
  16: {name: "Sei"},
  17: {name: "BNB Smart Chain"},
  18: {name: "XDC"},
  19: {name: "HyperEVM"},
  21: {name: "Ink"},
  22: {name: "Plume"},
  25: {name: "Starknet"},
  26: {name: "Arc testnet"},
  27: {name: "Stellar"},
  28: {name: "EDGE"},
  29: {name: "Injective"},
  30: {name: "Morph"},
  31: {name: "Pharos"},
  32: {name: "Cronos"},
  37: {name: "X Layer"},
};

/** Domains where mint_recipient is a 32-byte left-padded 20-byte EVM address. */
const EVM_CCTP_DOMAINS = new Set([
  0, 1, 2, 3, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 26, 28, 29,
  30, 31, 32, 37,
]);

export function getCctpDomainInfo(domain: number): CctpDomainInfo {
  return CCTP_DOMAINS[domain] ?? {name: `Domain ${domain}`};
}

export function isEvmCctpDomain(domain: number): boolean {
  return EVM_CCTP_DOMAINS.has(domain);
}
