import {normalizeAddress} from "../../utils";
import {
  Events,
  User_Transaction,
  WriteSetChangesModule,
  WriteSetChangesTable,
  WriteSetChangesResource,
  Transactions,
} from "../../gql/graphql";

export type TransactionCounterparty = {
  address: string;
  role: "receiver" | "smartContract";
};

// when the transaction counterparty is a "receiver",
//    the transaction is a user transfer (account A send money to account B)
// when the transaction counterparty is a "smartContract",
//    the transaction is a user interaction (account A interact with smart contract account B)
export function getTransactionCounterparty(
  transaction: User_Transaction,
): TransactionCounterparty | undefined {
  if (transaction.transaction_type !== "TRANSACTION_TYPE_USER") {
    return undefined;
  }

  if (!("payload" in transaction)) {
    return undefined;
  }

  // TODO(jill): bring it back
  // if (transaction.payload.type !== "entry_function_payload") {
  //   return undefined;
  // }

  // there are two scenarios that this transaction is an APT coin transfer:
  // 1. coins are transferred from account1 to account2:
  //    payload function is "0x1::coin::transfer" or "0x1::aptos_account::transfer_coins" and the first item in type_arguments is "0x1::aptos_coin::AptosCoin"
  // 2. coins are transferred from account1 to account2, and account2 is created upon transaction:
  //    payload function is "0x1::aptos_account::transfer" or "0x1::aptos_account::transfer_coins"
  // In both scenarios, the first item in arguments is the receiver's address, and the second item is the amount.

  const payload = transaction.payload;
  const typeArgument =
    payload.type_arguments.length > 0 ? payload.type_arguments[0] : undefined;
  const functionName = `${payload.function.module.address}::${payload.function.module.name}::${payload.function.name}`;
  const isAptCoinTransfer =
    (functionName === "0x1::coin::transfer" ||
      functionName === "0x1::aptos_account::transfer_coins") &&
    typeArgument === "0x1::aptos_coin::AptosCoin";
  const isAptCoinInitialTransfer =
    functionName === "0x1::aptos_account::transfer" ||
    functionName === "0x1::aptos_account::transfer_coins";

  if (
    (isAptCoinTransfer || isAptCoinInitialTransfer) &&
    payload.arguments.length === 2
  ) {
    return {
      address: payload.arguments[0],
      role: "receiver",
    };
  } else {
    return {
      address: payload.function.module.address,
      role: "smartContract",
    };
  }
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

export type TransactionAmount = {
  amountInvolved: bigint;
  balanceChanges: BalanceChange[];
};

export type BalanceChange = {
  address: string;
  amount: bigint;
  amountAfter: string;
};

function getBalanceMap(transaction: Transactions) {
  const events: Events[] =
    "events" in transaction ? (transaction.events as Events[]) : [];

  const accountToBalance = events.reduce(
    (
      balanceMap: {
        [key: string]: {
          amountAfter: string;
          amount: bigint;
        };
      },
      event: Events,
    ) => {
      const addr = normalizeAddress(event.account_address);
      if (
        event.event_type === "0x1::coin::DepositEvent" ||
        event.event_type === "0x1::coin::WithdrawEvent"
      ) {
        // deposit and withdraw events could be other coins
        // here we only care about APT events
        if (isAptEvent(event, transaction)) {
          if (!balanceMap[addr]) {
            balanceMap[addr] = {amount: BigInt(0), amountAfter: ""};
          }

          const amount = BigInt(event.data.amount);

          if (event.event_type === "0x1::coin::DepositEvent") {
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

function getAptChangeData(
  change:
    | WriteSetChangesModule
    | WriteSetChangesTable
    | WriteSetChangesResource,
): ChangeData | undefined {
  if (
    "address" in change &&
    "generic_type_params" in change &&
    change.generic_type_params.length > 0 &&
    change.generic_type_params[0].struct.address === "0x1" &&
    change.generic_type_params[0].struct.module === "aptos_coin" &&
    change.generic_type_params[0].struct.name === "AptosCoin"
    // todo(jill): add type in changes
    //  &&
    // "data" in change &&
    // "type" in change.data &&
    // change.data.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>" &&
    // "data" in change.data
  ) {
    return JSON.parse(JSON.stringify(change.data)) as ChangeData;
  } else {
    return undefined;
  }
}

function isAptEvent(event: Events, transaction: Transactions) {
  const wscTable = transaction.write_set_changes_table;
  const wscResource = transaction.write_set_changes_resource;
  const wscModule = transaction.write_set_changes_module;
  const changes: (
    | WriteSetChangesModule
    | WriteSetChangesTable
    | WriteSetChangesResource
  )[] = [...wscModule, ...wscTable, ...wscResource];
  const aptEventChange = changes.filter((change) => {
    if ("address" in change && change.address === event.account_address) {
      const data = getAptChangeData(change);
      if (data !== undefined) {
        const eventCreationNum = event.creation_number;
        let changeCreationNum;
        if (event.event_type === "0x1::coin::DepositEvent") {
          changeCreationNum = data.deposit_events.guid.id.creation_num;
        } else if (event.event_type === "0x1::coin::WithdrawEvent") {
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

export function getCoinBalanceChanges(
  transaction: Transactions,
): BalanceChange[] {
  const accountToBalance = getBalanceMap(transaction);
  const wscTable = transaction.write_set_changes_table;
  const wscResource = transaction.write_set_changes_resource;
  const wscModule = transaction.write_set_changes_module;
  const changes: (
    | WriteSetChangesModule
    | WriteSetChangesTable
    | WriteSetChangesResource
  )[] = [...wscModule, ...wscTable, ...wscResource];

  Object.entries(accountToBalance).forEach(([key]) => {
    changes.filter((change) => {
      if ("address" in change && change.address === key) {
        const data = getAptChangeData(change);
        if (data !== undefined) {
          accountToBalance[key].amountAfter = data.coin.value;
          return change;
        }
      }
    });
  });

  const balanceList: BalanceChange[] = [];
  Object.entries(accountToBalance).forEach(([key, value]) => {
    balanceList.push({
      address: key,
      amount: value.amount,
      amountAfter: value.amountAfter,
    });
  });

  return balanceList;
}

export function getCoinBalanceChangeForAccount(
  transaction: User_Transaction,
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
  transaction: User_Transaction,
): bigint | undefined {
  if (transaction.transaction_type !== "TRANSACTION_TYPE_USER") {
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
