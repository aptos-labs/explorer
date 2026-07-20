/**
 * Localnet integration tests for AIP-144 encrypted transaction payloads.
 *
 * Requires a running Aptos local testnet with encrypted submission enabled:
 *
 *   aptos node run-local-testnet --test-dir /tmp/aptos-localnet --force-restart --assume-yes --no-txn-stream
 *   # then patch /tmp/aptos-localnet/0/node.yaml:
 *   #   api.allow_encrypted_txns_submission: true
 *   # and restart without --force-restart
 *
 * Or run: `pnpm test:localnet:encrypted` (script starts/checks localnet).
 *
 * Skipped unless APTOS_LOCALNET=1 (or APTOS_LOCALNET_URL is set).
 *
 * // Covers FEAT-TXN-002 / FEAT-TXN-005 against a live localnet.
 */
import {Account, Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {
  encryptedStateLabel,
  extractDisplayableEntryFunctionPayload,
  isEncryptedTransactionPayload,
} from "./transactionPayload";

const LOCALNET_URL =
  process.env.APTOS_LOCALNET_URL ?? "http://127.0.0.1:8080/v1";
const FAUCET_URL = process.env.APTOS_FAUCET_URL ?? "http://127.0.0.1:8081";
const ENABLED =
  process.env.APTOS_LOCALNET === "1" || Boolean(process.env.APTOS_LOCALNET_URL);

async function fundAccount(
  aptos: Aptos,
  account: Account,
  amount = 1_000_000_000,
): Promise<void> {
  const addr = account.accountAddress.toString();
  const res = await fetch(
    `${FAUCET_URL}/mint?amount=${amount}&address=${addr}`,
    {
      method: "POST",
    },
  );
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`faucet failed ${res.status}: ${body}`);
  }
  let hashes: string[] = [];
  try {
    hashes = JSON.parse(body) as string[];
  } catch {
    hashes = [];
  }
  for (const hash of hashes) {
    try {
      await aptos.waitForTransaction({transactionHash: hash});
    } catch {
      // continue; balance poll below
    }
  }
  for (let i = 0; i < 30; i++) {
    try {
      const bal = await aptos.getAccountAPTAmount({
        accountAddress: account.accountAddress,
      });
      if (Number(bal) > 0) return;
    } catch {
      // account may not exist yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`funding timed out for ${addr}`);
}

describe.skipIf(!ENABLED)(
  "FEAT-TXN-002/005 — localnet encrypted payloads",
  () => {
    it("submits an encrypted transfer and explorer helpers parse the decrypted payload", {
      timeout: 120_000,
    }, async () => {
      const aptos = new Aptos(
        new AptosConfig({
          network: Network.LOCAL,
          fullnode: LOCALNET_URL,
          faucet: FAUCET_URL,
        }),
      );

      const ledger = await aptos.getLedgerInfo();
      expect(
        ledger.encryption_key,
        "localnet must expose ledger.encryption_key (set api.allow_encrypted_txns_submission: true)",
      ).toBeTruthy();

      const sender = Account.generate();
      const receiver = Account.generate();
      await fundAccount(aptos, sender);
      await fundAccount(aptos, receiver);

      const built = await aptos.transaction.build.simple({
        sender: sender.accountAddress,
        data: {
          function: "0x1::aptos_account::transfer",
          functionArguments: [receiver.accountAddress, 42],
        },
        options: {encrypted: true},
      });

      const pending = await aptos.signAndSubmitTransaction({
        signer: sender,
        transaction: built,
      });

      // Pending response should still be ciphertext-only.
      const pendingTxn = (await fetch(
        `${LOCALNET_URL}/transactions/by_hash/${pending.hash}`,
      ).then((r) => r.json())) as Types.Transaction;
      expect("payload" in pendingTxn).toBe(true);
      if ("payload" in pendingTxn) {
        expect(isEncryptedTransactionPayload(pendingTxn.payload)).toBe(true);
        if (isEncryptedTransactionPayload(pendingTxn.payload)) {
          expect(pendingTxn.payload.encrypted_state).toBe("encrypted");
          expect(
            extractDisplayableEntryFunctionPayload(pendingTxn),
          ).toBeUndefined();
          expect(encryptedStateLabel(pendingTxn.payload.encrypted_state)).toBe(
            "Encrypted",
          );
        }
      }

      const committed = (await aptos.waitForTransaction({
        transactionHash: pending.hash,
      })) as unknown as Types.Transaction;

      expect("payload" in committed).toBe(true);
      if (!("payload" in committed)) return;

      expect(isEncryptedTransactionPayload(committed.payload)).toBe(true);
      if (!isEncryptedTransactionPayload(committed.payload)) return;

      expect(committed.payload.encrypted_state).toBe("decrypted");
      expect(encryptedStateLabel(committed.payload.encrypted_state)).toBe(
        "Decrypted",
      );

      const entry = extractDisplayableEntryFunctionPayload(committed);
      expect(entry).toEqual({
        type: "entry_function_payload",
        function: "0x1::aptos_account::transfer",
        type_arguments: [],
        arguments: [receiver.accountAddress.toString(), "42"],
      });
    });
  },
);
