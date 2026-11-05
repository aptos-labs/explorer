import type {Aptos, AptosConfig} from "@aptos-labs/ts-sdk";
import {
  getAccountInfo,
  getAccountModule,
  getAccountModules,
  getAccountResource,
  getAccountResources,
  getAccountTransactions,
} from "@aptos-labs/ts-sdk/account";
import {getAccountNames, getName, getPrimaryName} from "@aptos-labs/ts-sdk/ans";
import {getDigitalAssetActivity} from "@aptos-labs/ts-sdk/digitalAsset";
import {getLedgerInfo, queryIndexer} from "@aptos-labs/ts-sdk/general";
import {getTableItem} from "@aptos-labs/ts-sdk/table";
import {
  getBlockByHeight,
  getBlockByVersion,
  getTransactionByHash,
  getTransactionByVersion,
  getTransactions,
  waitForTransaction,
} from "@aptos-labs/ts-sdk/transaction";
import {view} from "@aptos-labs/ts-sdk/view";

type ClientMethods =
  | "getAccountInfo"
  | "getAccountModule"
  | "getAccountModules"
  | "getAccountNames"
  | "getAccountResource"
  | "getAccountResources"
  | "getAccountTransactions"
  | "getBlockByHeight"
  | "getBlockByVersion"
  | "getDigitalAssetActivity"
  | "getLedgerInfo"
  | "getName"
  | "getPrimaryName"
  | "getTableItem"
  | "getTransactionByHash"
  | "getTransactionByVersion"
  | "getTransactions"
  | "queryIndexer"
  | "view"
  | "waitForTransaction";

type TransactionMethods = {
  build: Pick<Aptos["transaction"]["build"], "simple">;
  simulate: Pick<Aptos["transaction"]["simulate"], "simple">;
};

/**
 * The subset of the SDK `Aptos` client the explorer uses, built on the
 * tree-shakeable `@aptos-labs/ts-sdk/*` function exports. The `Aptos` class
 * references every SDK namespace (keyless, Poseidon constants, transaction
 * submission), roughly 550 kB gzip; these reads are about 25 kB.
 *
 * Transaction build/simulate pull in that keyless/Poseidon code, so they load
 * on first use. Add methods here (as thin `{aptosConfig, ...args}` wrappers,
 * matching the `Aptos` class) instead of importing `Aptos` at runtime.
 */
export class AptosSdkClient implements Pick<Aptos, ClientMethods> {
  readonly transaction: TransactionMethods;

  constructor(readonly config: AptosConfig) {
    this.transaction = {
      build: {
        simple: async (args) => {
          const {generateTransaction} = await import("./aptosSdkTransactions");
          const {sender} = args;
          return generateTransaction({
            aptosConfig: this.config,
            ...args,
            sender:
              typeof sender === "object" && "accountAddress" in sender
                ? sender.accountAddress
                : sender,
          });
        },
      },
      simulate: {
        simple: async (args) => {
          const {simulateTransaction} = await import("./aptosSdkTransactions");
          return simulateTransaction({aptosConfig: this.config, ...args});
        },
      },
    };
  }

  getLedgerInfo: Aptos["getLedgerInfo"] = () =>
    getLedgerInfo({aptosConfig: this.config});

  queryIndexer: Aptos["queryIndexer"] = (args) =>
    queryIndexer({aptosConfig: this.config, ...args});

  view: Aptos["view"] = (args) => view({aptosConfig: this.config, ...args});

  getTableItem: Aptos["getTableItem"] = (args) =>
    getTableItem({aptosConfig: this.config, ...args});

  getPrimaryName: Aptos["getPrimaryName"] = (args) =>
    getPrimaryName({aptosConfig: this.config, ...args});

  getName: Aptos["getName"] = (args) =>
    getName({aptosConfig: this.config, ...args});

  getAccountNames: Aptos["getAccountNames"] = (args) =>
    getAccountNames({aptosConfig: this.config, ...args});

  getDigitalAssetActivity: Aptos["getDigitalAssetActivity"] = (args) =>
    getDigitalAssetActivity({aptosConfig: this.config, ...args});

  getTransactions: Aptos["getTransactions"] = (args) =>
    getTransactions({aptosConfig: this.config, ...args});

  getTransactionByVersion: Aptos["getTransactionByVersion"] = (args) =>
    getTransactionByVersion({aptosConfig: this.config, ...args});

  getTransactionByHash: Aptos["getTransactionByHash"] = (args) =>
    getTransactionByHash({aptosConfig: this.config, ...args});

  waitForTransaction: Aptos["waitForTransaction"] = (args) =>
    waitForTransaction({aptosConfig: this.config, ...args});

  getBlockByVersion: Aptos["getBlockByVersion"] = (args) =>
    getBlockByVersion({aptosConfig: this.config, ...args});

  getBlockByHeight: Aptos["getBlockByHeight"] = (args) =>
    getBlockByHeight({aptosConfig: this.config, ...args});

  getAccountInfo: Aptos["getAccountInfo"] = (args) =>
    getAccountInfo({aptosConfig: this.config, ...args});

  getAccountModules: Aptos["getAccountModules"] = (args) =>
    getAccountModules({aptosConfig: this.config, ...args});

  getAccountModule: Aptos["getAccountModule"] = (args) =>
    getAccountModule({aptosConfig: this.config, ...args});

  getAccountTransactions: Aptos["getAccountTransactions"] = (args) =>
    getAccountTransactions({aptosConfig: this.config, ...args});

  getAccountResources: Aptos["getAccountResources"] = (args) =>
    getAccountResources({aptosConfig: this.config, ...args});

  getAccountResource: Aptos["getAccountResource"] = (args) =>
    getAccountResource({aptosConfig: this.config, ...args});
}
