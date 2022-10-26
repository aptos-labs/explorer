import {Types} from "aptos";

export type TransactionCounterparty = {
  address: string;
  role: "receiver" | "smartContract";
};

// when the transaction counterparty is a "receiver",
//    the transaction is a user transfer (account A send money to account B)
// when the transaction counterparty is a "smartContract",
//    the transaction is a user interaction (account A interact with smart contract account B)
export function getTransactionCounterparty(
  transaction: Types.Transaction,
): TransactionCounterparty | undefined {
  if (transaction.type !== "user_transaction") {
    return undefined;
  }

  if (!("payload" in transaction)) {
    return undefined;
  }

  if (transaction.payload.type !== "entry_function_payload") {
    return undefined;
  }

  // there are two scenarios that this transaction is an APT coin transfer:
  // 1. coins are transferred from account1 to account2:
  //    payload function is "0x1::coin::transfer" and the first item in type_arguments is "0x1::aptos_coin::AptosCoin"
  // 2. coins are transferred from account1 to account2, and account2 is created upon transaction:
  //    payload function is "0x1::aptos_account::transfer"
  // In both scenarios, the first item in arguments is the receiver's address, and the second item is the amount.

  const payload =
    transaction.payload as Types.TransactionPayload_EntryFunctionPayload;
  const typeArgument =
    payload.type_arguments.length > 0 ? payload.type_arguments[0] : undefined;
  const isAptCoinTransfer =
    payload.function === "0x1::coin::transfer" &&
    typeArgument === "0x1::aptos_coin::AptosCoin";
  const isAptCoinInitialTransfer =
    payload.function === "0x1::aptos_account::transfer";

  if (
    (isAptCoinTransfer || isAptCoinInitialTransfer) &&
    payload.arguments.length === 2
  ) {
    return {
      address: payload.arguments[0],
      role: "receiver",
    };
  } else {
    const smartContractAddr = payload.function.split("::")[0];
    return {
      address: smartContractAddr,
      role: "smartContract",
    };
  }
}

export type TransactionAmount = {
  amountInvolved: bigint;
  balanceChanges: BalanceChange[];
};

export type BalanceChange = {
  address: string;
  amount: bigint;
  amountAfter: string;
};

function getBalanceMap(transaction: Types.Transaction) {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  const accountToBalance = events.reduce(
    (
      balanceMap: {
        [key: string]: {
          amountAfter: string;
          amount: bigint;
        };
      },
      event: Types.Event,
    ) => {
      const addr = event.guid.account_address;

      if (
        event.type === "0x1::coin::DepositEvent" ||
        event.type === "0x1::coin::WithdrawEvent"
      ) {
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

      return balanceMap;
    },
    {},
  );

  return accountToBalance;
}

export function getCoinBalanceChange(
  transaction: Types.Transaction,
): BalanceChange[] {
  const accountToBalance = getBalanceMap(transaction);

  const changes: Types.WriteSetChange[] =
    "changes" in transaction ? transaction.changes : [];

  Object.entries(accountToBalance).forEach(([key]) => {
    changes.filter((change) => {
      if ("address" in change && change.address === key) {
        if (
          "data" in change &&
          "type" in change.data &&
          change.data.type ===
            "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        ) {
          if ("data" in change.data) {
            const data: {coin: {value: string}} = JSON.parse(
              JSON.stringify(change.data.data),
            );
            accountToBalance[key].amountAfter = data.coin.value;
          }

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
  transaction: Types.Transaction,
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
  transaction: Types.Transaction,
): bigint | undefined {
  if (transaction.type !== "user_transaction") {
    return undefined;
  }

  const accountToBalance = getBalanceMap(transaction);

  const txnAmount = Object.values(accountToBalance).reduce(
    (totalAmount: bigint, value) => {
      if (value.amount > 0) {
        totalAmount += value.amount;
      }
      return totalAmount;
    },
    BigInt(0),
  );

  return txnAmount;
}
