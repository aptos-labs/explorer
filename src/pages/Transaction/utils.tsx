import {Types} from "aptos";

export type BalanceChange = {
  address: string;
  amount: bigint;
  amountAfter: string;
};

export function getCoinBalanceChange(
  transaction: Types.Transaction,
): BalanceChange[] {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  const accountToBalance = events.reduce(function (
    balanceMap: {
      [key: string]: {
        amountAfter: string;
        amount: bigint;
      };
    },
    event: Types.Event,
  ) {
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
  }, {});

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
