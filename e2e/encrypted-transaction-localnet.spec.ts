import {Account, Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import {expect, test} from "@playwright/test";

/**
 * FEAT-TXN-002 / FEAT-TXN-005 — encrypted transaction UI against a live localnet.
 *
 * Skips unless APTOS_LOCALNET=1 and http://127.0.0.1:8080/v1 exposes encryption_key.
 *
 * // Covers FEAT-TXN-002 / FEAT-TXN-005
 */
const LOCALNET_URL =
  process.env.APTOS_LOCALNET_URL ?? "http://127.0.0.1:8080/v1";
const FAUCET_URL = process.env.APTOS_FAUCET_URL ?? "http://127.0.0.1:8081";
const ENABLED = process.env.APTOS_LOCALNET === "1";

async function fund(aptos: Aptos, account: Account) {
  const addr = account.accountAddress.toString();
  const res = await fetch(
    `${FAUCET_URL}/mint?amount=1000000000&address=${addr}`,
    {method: "POST"},
  );
  const body = await res.text();
  if (!res.ok) throw new Error(`faucet failed ${res.status}: ${body}`);
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
      // ignore
    }
  }
}

async function submitEncryptedTransfer(): Promise<string> {
  const aptos = new Aptos(
    new AptosConfig({
      network: Network.LOCAL,
      fullnode: LOCALNET_URL,
      faucet: FAUCET_URL,
    }),
  );
  const sender = Account.generate();
  const receiver = Account.generate();
  await fund(aptos, sender);
  await fund(aptos, receiver);
  const built = await aptos.transaction.build.simple({
    sender: sender.accountAddress,
    data: {
      function: "0x1::aptos_account::transfer",
      functionArguments: [receiver.accountAddress, 11],
    },
    options: {encrypted: true},
  });
  const pending = await aptos.signAndSubmitTransaction({
    signer: sender,
    transaction: built,
  });
  await aptos.waitForTransaction({transactionHash: pending.hash});
  return pending.hash;
}

test.describe("encrypted transaction localnet", () => {
  test.beforeEach(async () => {
    test.skip(!ENABLED, "Set APTOS_LOCALNET=1 to run localnet encrypted e2e");
    let ledger: {encryption_key?: string | null};
    try {
      ledger = await fetch(LOCALNET_URL).then((r) => r.json());
    } catch {
      test.skip(true, `localnet not reachable at ${LOCALNET_URL}`);
      return;
    }
    test.skip(
      !ledger.encryption_key,
      "localnet ledger.encryption_key is null; enable allow_encrypted_txns_submission",
    );
  });

  test("overview shows decrypted encrypted transfer", async ({page}) => {
    test.setTimeout(180_000);
    const hash = await submitEncryptedTransfer();

    await page.goto(`/txn/${hash}/userTxnOverview?network=local`, {
      waitUntil: "domcontentloaded",
    });

    // Encryption chips on overview
    await expect(page.getByText("Encrypted payload")).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByText("Decrypted", {exact: true})).toBeVisible();

    // Function line should resolve the inner transfer (Coin Transfer shortcut
    // only for 0x1::coin::transfer / aptos_account::transfer — shows "Coin Transfer").
    await expect(page.getByText("Coin Transfer")).toBeVisible();

    // Payload tab
    await page.goto(`/txn/${hash}/payload?network=local`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Encrypted transaction")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText("Decrypted payload")).toBeVisible();
    await expect(page.getByText("encrypted_transaction_payload")).toBeVisible();
  });
});
