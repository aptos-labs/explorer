#!/usr/bin/env node
/**
 * Submit an encrypted APT transfer on a local Aptos testnet and print the
 * pending + decrypted payload shapes the explorer consumes.
 *
 * Prerequisites:
 *   1. Aptos CLI installed (`curl -fsSL https://aptos.dev/scripts/install_cli.sh | sh`)
 *   2. Localnet running with encrypted submission enabled:
 *        aptos node run-local-testnet --test-dir /tmp/aptos-localnet \
 *          --force-restart --assume-yes --no-txn-stream
 *      Then set in `/tmp/aptos-localnet/0/node.yaml`:
 *        api:
 *          allow_encrypted_txns_submission: true
 *      Restart without `--force-restart`. Ledger `/v1` must show a non-null
 *      `encryption_key`.
 *
 * Usage:
 *   node scripts/test-encrypted-txn-localnet.mjs
 *   APTOS_NODE_URL=http://127.0.0.1:8080/v1 APTOS_FAUCET_URL=http://127.0.0.1:8081 \
 *     node scripts/test-encrypted-txn-localnet.mjs
 */
import {Account, Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import fs from "node:fs";
import path from "node:path";

const FULLNODE = process.env.APTOS_NODE_URL ?? "http://127.0.0.1:8080/v1";
const FAUCET = process.env.APTOS_FAUCET_URL ?? "http://127.0.0.1:8081";
const OUT_DIR = process.env.ENCRYPTED_TXN_OUT_DIR ?? "/tmp";

const aptos = new Aptos(
  new AptosConfig({
    network: Network.LOCAL,
    fullnode: FULLNODE,
    faucet: FAUCET,
  }),
);

async function fund(account, amount = 1_000_000_000) {
  const addr = account.accountAddress.toString();
  const res = await fetch(`${FAUCET}/mint?amount=${amount}&address=${addr}`, {
    method: "POST",
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`faucet failed ${res.status}: ${body}`);
  let hashes = [];
  try {
    hashes = JSON.parse(body);
  } catch {
    hashes = [];
  }
  for (const hash of hashes) {
    try {
      await aptos.waitForTransaction({transactionHash: hash});
    } catch {
      // ignore
    }
  }
  for (let i = 0; i < 30; i++) {
    try {
      const bal = await aptos.getAccountAPTAmount({
        accountAddress: account.accountAddress,
      });
      if (Number(bal) > 0) {
        console.log(`funded ${addr} balance=${bal}`);
        return;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`funding timed out for ${addr}: ${body}`);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const ledger = await aptos.getLedgerInfo();
  assert(
    ledger.encryption_key,
    "ledger.encryption_key is null — enable api.allow_encrypted_txns_submission and restart localnet",
  );
  console.log("✓ ledger exposes encryption_key");

  const sender = Account.generate();
  const receiver = Account.generate();
  console.log("sender", sender.accountAddress.toString());
  console.log("receiver", receiver.accountAddress.toString());
  await fund(sender);
  await fund(receiver);

  const transaction = await aptos.transaction.build.simple({
    sender: sender.accountAddress,
    data: {
      function: "0x1::aptos_account::transfer",
      functionArguments: [receiver.accountAddress, 42],
    },
    options: {encrypted: true},
  });
  console.log(
    "✓ built encrypted payload:",
    transaction.rawTransaction.payload.constructor.name,
  );

  const pending = await aptos.signAndSubmitTransaction({
    signer: sender,
    transaction,
  });
  console.log("pending hash", pending.hash);

  const pendingTxn = await fetch(
    `${FULLNODE}/transactions/by_hash/${pending.hash}`,
  ).then((r) => r.json());
  assert(
    pendingTxn.payload?.type === "encrypted_transaction_payload",
    `expected encrypted_transaction_payload, got ${pendingTxn.payload?.type}`,
  );
  assert(
    pendingTxn.payload?.encrypted_state === "encrypted",
    `expected pending encrypted_state=encrypted, got ${pendingTxn.payload?.encrypted_state}`,
  );
  console.log("✓ pending txn ciphertext-only (encrypted_state=encrypted)");

  const pendingPath = path.join(OUT_DIR, "encrypted-txn-pending-localnet.json");
  fs.writeFileSync(pendingPath, JSON.stringify(pendingTxn, null, 2));

  const committed = await aptos.waitForTransaction({
    transactionHash: pending.hash,
  });
  assert(committed.success, `txn failed: ${committed.vm_status}`);
  assert(
    committed.payload?.type === "encrypted_transaction_payload",
    `expected encrypted_transaction_payload, got ${committed.payload?.type}`,
  );
  assert(
    committed.payload?.encrypted_state === "decrypted",
    `expected decrypted, got ${committed.payload?.encrypted_state}`,
  );
  assert(
    committed.payload?.decrypted_payload?.function ===
      "0x1::aptos_account::transfer",
    `unexpected decrypted function: ${committed.payload?.decrypted_payload?.function}`,
  );
  console.log("✓ committed decrypted entry function:");
  console.log(JSON.stringify(committed.payload.decrypted_payload, null, 2));

  const committedPath = path.join(
    OUT_DIR,
    "encrypted-txn-decrypted-localnet.json",
  );
  fs.writeFileSync(committedPath, JSON.stringify(committed, null, 2));

  console.log("");
  console.log("Explorer URLs (with localnet selected):");
  console.log(`  /txn/${pending.hash}?network=local`);
  console.log(`  /txn/${pending.hash}/payload?network=local`);
  console.log(`fixtures: ${pendingPath}`);
  console.log(`          ${committedPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
