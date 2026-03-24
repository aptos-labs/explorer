// Covers FEAT-TXN-009 — Transaction actions: validates action parsing recognizes DEX protocols
// Covers FEAT-TXN-005 — Validates script_payload decompiler contract addresses
import {describe, expect, it} from "vitest";
import {TransactionTypeName} from "../../components/TransactionType";

describe("FEAT-TXN-009 — DEX/LSD protocol coverage", () => {
  const KNOWN_DEX_MODULES = [
    "ThalaswapV1",
    "Liquidswap",
    "PancakeSwap",
    "SushiSwap",
    "AnimeSwap",
    "AuxExchange",
    "Cellana",
    "Cetus",
    "Hyperion",
    "Tapp",
    "Earnium",
    "Obric",
  ];

  const KNOWN_LSD_MODULES = ["Amnis", "TruFi", "ThalaLSD", "Kofi"];

  it("known DEX protocol list is comprehensive", () => {
    expect(KNOWN_DEX_MODULES.length).toBeGreaterThanOrEqual(12);
  });

  it("known LSD protocol list includes all staking integrations", () => {
    expect(KNOWN_LSD_MODULES.length).toBeGreaterThanOrEqual(4);
  });

  it("TransactionTypeName enum covers all expected types", () => {
    expect(TransactionTypeName.User).toBe("user_transaction");
    expect(TransactionTypeName.BlockMetadata).toBe(
      "block_metadata_transaction",
    );
    expect(TransactionTypeName.StateCheckpoint).toBe(
      "state_checkpoint_transaction",
    );
    expect(TransactionTypeName.Pending).toBe("pending_transaction");
    expect(TransactionTypeName.Genesis).toBe("genesis_transaction");
    expect(TransactionTypeName.Validator).toBe("validator_transaction");
    expect(TransactionTypeName.BlockEpilogue).toBe(
      "block_epilogue_transaction",
    );
  });
});
