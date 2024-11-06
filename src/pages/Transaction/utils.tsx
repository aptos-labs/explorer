import {standardizeAddress, tryStandardizeAddress} from "../../utils";
import {gql, useQuery as useGraphqlQuery} from "@apollo/client";
import {
  Event,
  EntryFunctionPayloadResponse,
  isUserTransactionResponse,
  TransactionResponse,
  WriteSetChange,
} from "@aptos-labs/ts-sdk";

export type TransactionCounterparty = {
  address: string;
  role: "receiver" | "smartContract";
};

// when the transaction counterparty is a "receiver",
//    the transaction is a user transfer (account A send money to account B)
// when the transaction counterparty is a "smartContract",
//    the transaction is a user interaction (account A interact with smart contract account B)
export function getTransactionCounterparty(
  transaction: TransactionResponse,
): TransactionCounterparty | undefined {
  if (!isUserTransactionResponse(transaction)) {
    return undefined;
  }

  if (!("payload" in transaction)) {
    return undefined;
  }

  let payload: EntryFunctionPayloadResponse;
  if (transaction.payload.type === "entry_function_payload") {
    payload = transaction.payload as EntryFunctionPayloadResponse;
  } else if (
    transaction.payload.type === "multisig_payload" &&
    "transaction_payload" in transaction.payload &&
    transaction.payload.transaction_payload &&
    "type" in transaction.payload.transaction_payload &&
    transaction.payload.transaction_payload.type === "entry_function_payload"
  ) {
    payload = transaction.payload
      .transaction_payload as EntryFunctionPayloadResponse;
  } else {
    return undefined;
  }

  // there are two scenarios that this transaction is an APT coin transfer:
  // 1. coins are transferred from account1 to account2:
  //    payload function is "0x1::coin::transfer" or "0x1::aptos_account::transfer_coins" and the first item in type_arguments is "0x1::aptos_coin::AptosCoin"
  // 2. coins are transferred from account1 to account2, and account2 is created upon transaction:
  //    payload function is "0x1::aptos_account::transfer" or "0x1::aptos_account::transfer_coins"
  // In both scenarios, the first item in arguments is the receiver's address, and the second item is the amount.

  const isCoinTransfer =
    payload.function === "0x1::coin::transfer" ||
    payload.function === "0x1::aptos_account::transfer_coins" ||
    payload.function === "0x1::aptos_account::transfer" ||
    payload.function === "0x1::aptos_account::fungible_transfer_only";
  const isPrimaryFaTransfer =
    payload.function === "0x1::primary_fungible_store::transfer";

  const isObjectTransfer = payload.function === "0x1::object::transfer";
  const isTokenV2MintSoulbound =
    payload.function === "0x4::aptos_token::mint_soul_bound";

  if (isCoinTransfer) {
    return {
      address: payload.arguments[0],
      role: "receiver",
    };
  }

  if (isPrimaryFaTransfer) {
    return {
      address: payload.arguments[1],
      role: "receiver",
    };
  }

  if (isObjectTransfer) {
    return {
      address: payload.arguments[1],
      role: "receiver",
    };
  }
  if (isTokenV2MintSoulbound) {
    return {
      address: payload.arguments[7],
      role: "receiver",
    };
  }

  const smartContractAddr = payload.function.split("::")[0];
  return {
    address: smartContractAddr,
    role: "smartContract",
  };
}

type ChangeData = {
  coin: {value: string};
  deposit_events: {
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  withdraw_events: {
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
};

export type BalanceChange = {
  address: string;
  amount: bigint;
  type: string;
  asset: {
    decimals: number;
    symbol: string;
    type: string;
    id: string;
  };
  known: boolean;
  isBanned?: boolean;
  logoUrl?: string;
  isInPanoraTokenList?: boolean;
};

function getBalanceMap(transaction: TransactionResponse) {
  const events: Event[] = "events" in transaction ? transaction.events : [];

  const accountToBalance = events.reduce(
    (
      balanceMap: {
        [key: string]: {
          amountAfter: string;
          amount: bigint;
        };
      },
      event: Event,
    ) => {
      const addr = standardizeAddress(event.guid.account_address);

      if (
        event.type === "0x1::coin::DepositEvent" ||
        event.type === "0x1::coin::WithdrawEvent"
      ) {
        // deposit and withdraw events could be other coins
        // here we only care about APT events
        if (isAptEvent(event, transaction)) {
          if (!balanceMap[addr]) {
            balanceMap[addr] = {amount: BigInt(0), amountAfter: ""};
          }

          const amount = BigInt(event.data.amount);

          if (event.type === "0x1::coin::DepositEvent") {
            balanceMap[addr].amount += amount;
          } else {
            balanceMap[addr].amount -= amount;
          }
        }
      }

      return balanceMap;
    },
    {},
  );

  return accountToBalance;
}

function getAptChangeData(change: WriteSetChange): ChangeData | undefined {
  if (
    "address" in change &&
    "data" in change &&
    "type" in change.data &&
    change.data.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>" &&
    "data" in change.data
  ) {
    return JSON.parse(JSON.stringify(change.data.data)) as ChangeData;
  } else {
    return undefined;
  }
}

function isAptEvent(event: Event, transaction: TransactionResponse) {
  const changes: WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  const aptEventChange = changes.filter((change) => {
    if (
      "address" in change &&
      change.address &&
      tryStandardizeAddress(change.address) ===
        tryStandardizeAddress(event.guid.account_address)
    ) {
      const data = getAptChangeData(change);
      if (data !== undefined) {
        const eventCreationNum = event.guid.creation_number;
        let changeCreationNum;
        if (event.type === "0x1::coin::DepositEvent") {
          changeCreationNum = data.deposit_events.guid.id.creation_num;
        } else if (event.type === "0x1::coin::WithdrawEvent") {
          changeCreationNum = data.withdraw_events.guid.id.creation_num;
        }
        if (eventCreationNum === changeCreationNum) {
          return change;
        }
      }
    }
  });

  return aptEventChange.length > 0;
}

interface FATransactionResponse {
  fungible_asset_activities: Array<FungibleAssetActivity>;
}

export interface FungibleAssetActivity {
  amount: number;
  entry_function_id_str: string;
  gas_fee_payer_address?: string;
  is_frozen?: boolean;
  asset_type: string;
  event_index: number;
  owner_address: string;
  transaction_timestamp: string;
  transaction_version: number;
  type: string;
  storage_refund_amount: number;
  metadata: {
    asset_type: string;
    decimals: number;
    symbol: string;
  };
}

export function useTransactionBalanceChanges(txn_version: string) {
  const {loading, error, data} = useGraphqlQuery<FATransactionResponse>(
    gql`
        query TransactionQuery($txn_version: String) {
            fungible_asset_activities(
                where: {transaction_version: {_eq: ${txn_version}}}
            ) {
                amount
                entry_function_id_str
                gas_fee_payer_address
                is_frozen
                asset_type
                event_index
                owner_address
                transaction_timestamp
                transaction_version
                type
                storage_refund_amount
                metadata {
                    asset_type
                    decimals
                    symbol
                }
            }
        }
    `,
    {variables: {txn_version}},
  );

  return {
    isLoading: loading,
    error,
    data,
  };
}

export function getCoinBalanceChangeForAccount(
  transaction: TransactionResponse,
  address: string,
): bigint {
  const accountToBalance = getBalanceMap(transaction);

  if (!accountToBalance.hasOwnProperty(address)) {
    return BigInt(0);
  }

  const accountBalance = accountToBalance[address];
  return accountBalance.amount;
}

export function getTransactionAmount(
  transaction: TransactionResponse,
): bigint | undefined {
  if (!isUserTransactionResponse(transaction)) {
    return undefined;
  }

  const accountToBalance = getBalanceMap(transaction);

  const [totalDepositAmount, totalWithdrawAmount] = Object.values(
    accountToBalance,
  ).reduce(
    ([totalDepositAmount, totalWithdrawAmount]: bigint[], value) => {
      if (value.amount > 0) {
        totalDepositAmount += value.amount;
      }
      if (value.amount < 0) {
        totalWithdrawAmount -= value.amount;
      }
      return [totalDepositAmount, totalWithdrawAmount];
    },
    [BigInt(0), BigInt(0)],
  );

  return totalDepositAmount > totalWithdrawAmount
    ? totalDepositAmount
    : totalWithdrawAmount;
}
