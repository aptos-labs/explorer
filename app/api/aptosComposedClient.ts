/**
 * Tree-shakeable Aptos client that excludes the Keyless/poseidon-lite dependency.
 *
 * `new Aptos(config)` statically imports the Keyless namespace at module init,
 * pulling ~610 KB of poseidon-lite into the client bundle. By composing the
 * individual namespace classes we get identical runtime behaviour without that
 * cost — each namespace class uses dynamic import() for keyless paths.
 */

import {Account as AccountNS} from "@aptos-labs/ts-sdk/account";
import {ANS} from "@aptos-labs/ts-sdk/ans";
import {Coin} from "@aptos-labs/ts-sdk/coin";
import {DigitalAsset} from "@aptos-labs/ts-sdk/digitalAsset";
import {FungibleAsset} from "@aptos-labs/ts-sdk/fungibleAsset";
import {General} from "@aptos-labs/ts-sdk/general";
import {Staking} from "@aptos-labs/ts-sdk/staking";
import {Table} from "@aptos-labs/ts-sdk/table";
import {Transaction} from "@aptos-labs/ts-sdk/transaction";

export type {AptosConfig} from "@aptos-labs/ts-sdk";

/**
 * Intersection of all Aptos namespace classes except Keyless, plus the
 * namespace accessor properties (e.g. `.transaction`, `.account`) used by
 * code that calls sub-builders like `client.transaction.build.simple()`.
 *
 * Drop-in structural replacement for `Aptos` wherever keyless methods are not
 * needed.
 */
export type AptosComposedClient = General &
  AccountNS &
  ANS &
  Coin &
  DigitalAsset &
  FungibleAsset &
  Staking &
  Table &
  Transaction & {
    general: General;
    account: AccountNS;
    ans: ANS;
    coin: Coin;
    digitalAsset: DigitalAsset;
    fungibleAsset: FungibleAsset;
    staking: Staking;
    table: Table;
    transaction: Transaction;
  };

/**
 * Build an `AptosComposedClient` from an `AptosConfig`.
 *
 * Each namespace instance is stored under its conventional property name
 * (e.g. `client.transaction`) for code that uses sub-builders, AND its
 * prototype methods are bound flat on the composed object for code that calls
 * `client.getTransactionByHash()` directly.
 */
export function createAptosComposedClient(
  config: ConstructorParameters<typeof General>[0],
): AptosComposedClient {
  const general = new General(config);
  const account = new AccountNS(config);
  const ans = new ANS(config);
  const coin = new Coin(config);
  const digitalAsset = new DigitalAsset(config);
  const fungibleAsset = new FungibleAsset(config);
  const staking = new Staking(config);
  const table = new Table(config);
  const transaction = new Transaction(config);

  // Namespace accessor properties — mirrors what `Aptos` exposes via getters
  const client: Record<string, unknown> = {
    config,
    general,
    account,
    ans,
    coin,
    digitalAsset,
    fungibleAsset,
    staking,
    table,
    transaction,
  };

  const namespaces: object[] = [
    general,
    account,
    ans,
    coin,
    digitalAsset,
    fungibleAsset,
    staking,
    table,
    transaction,
  ];

  for (const ns of namespaces) {
    // Bind prototype methods flat (getLedgerInfo, getAccountInfo, etc.)
    const proto = Object.getPrototypeOf(ns) as object;
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === "constructor" || key in client) continue;
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc && typeof desc.value === "function") {
        client[key] = desc.value.bind(ns);
      }
    }
    // Copy eagerly-constructed instance sub-properties (e.g. Transaction.build,
    // Transaction.simulate, Account.abstraction) that aren't already set above.
    for (const key of Object.getOwnPropertyNames(ns)) {
      if (key === "config" || key in client) continue;
      const desc = Object.getOwnPropertyDescriptor(ns, key);
      if (desc) Object.defineProperty(client, key, desc);
    }
  }

  return client as unknown as AptosComposedClient;
}
