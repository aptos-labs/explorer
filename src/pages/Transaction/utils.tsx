import {Types} from "aptos";

export type BalanceChange = {
  address: string;
  change: number;
};

export function getCoinBalanceChange(
  transaction: Types.Transaction,
): BalanceChange[] {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  const accountToBalance = events.reduce(function (
    balanceMap: {[key: string]: number},
    event: Types.Event,
  ) {
    const addr = event.guid.account_address;

    if (
      event.type === "0x1::coin::DepositEvent" ||
      event.type === "0x1::coin::WithdrawEvent"
    ) {
      if (!balanceMap[addr]) {
        balanceMap[addr] = 0;
      }

      const amount = parseInt(event.data.amount);

      if (event.type === "0x1::coin::DepositEvent") {
        balanceMap[addr] += amount;
      } else {
        balanceMap[addr] -= amount;
      }
    }

    return balanceMap;
  },
  {});

  const balanceList: BalanceChange[] = [];
  Object.entries(accountToBalance).forEach(([key, value]) => {
    balanceList.push({
      address: key,
      change: value,
    });
  });

  return balanceList;
}
