import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../../utils";
import HashButton, {HashType} from "../../../../components/HashButton";
import {BalanceChange} from "../../utils";
import {APTCurrencyValue} from "../../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {
  negativeColor,
  primary,
} from "../../../../themes/colors/aptosColorPalette";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";
import {UserTransactionResponse} from "@aptos-labs/ts-sdk";

function getIsSender(
  address: string,
  transaction: UserTransactionResponse,
): boolean {
  return transaction.sender === address;
}

function getGas(transaction: UserTransactionResponse): bigint {
  return BigInt(transaction.gas_unit_price) * BigInt(transaction.gas_used);
}

type BalanceChangeCellProps = {
  balanceChange: BalanceChange;
  transaction: UserTransactionResponse;
};

function AddressCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell>
      <HashButton hash={balanceChange.address} type={HashType.ACCOUNT} />
    </GeneralTableCell>
  );
}

function AmountBeforeCell({
  balanceChange,
  transaction,
}: BalanceChangeCellProps) {
  let amountBefore = BigInt(balanceChange.amountAfter) - balanceChange.amount;

  const isSender = getIsSender(balanceChange.address, transaction);
  if (isSender) {
    amountBefore += getGas(transaction);
  }

  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <APTCurrencyValue amount={amountBefore.toString()} />
    </GeneralTableCell>
  );
}

function AmountAfterCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <APTCurrencyValue amount={balanceChange.amountAfter} />
    </GeneralTableCell>
  );
}

function GasCell({balanceChange, transaction}: BalanceChangeCellProps) {
  const isSender = getIsSender(balanceChange.address, transaction);

  if (!isSender) {
    return <GeneralTableCell />;
  }

  return (
    <GeneralTableCell
      sx={{
        textAlign: "right",
        color: negativeColor,
      }}
    >
      {"-"}
      <APTCurrencyValue amount={getGas(transaction).toString()} />
    </GeneralTableCell>
  );
}

function AmountCell({balanceChange}: BalanceChangeCellProps) {
  const isNegative = balanceChange.amount < 0;
  const amount =
    balanceChange.amount < 0 ? -balanceChange.amount : balanceChange.amount;

  return (
    <GeneralTableCell
      sx={{
        textAlign: "right",
        color: isNegative ? negativeColor : primary[600],
      }}
    >
      {isNegative ? "-" : "+"}
      <APTCurrencyValue amount={amount.toString()} />
    </GeneralTableCell>
  );
}

const BalanceChangeCells = Object.freeze({
  address: AddressCell,
  amountBefore: AmountBeforeCell,
  amountAfter: AmountAfterCell,
  gas: GasCell,
  amount: AmountCell,
});

type Column = keyof typeof BalanceChangeCells;

const DEFAULT_COLUMNS: Column[] = [
  "address",
  "amountBefore",
  "gas",
  "amount",
  "amountAfter",
];

type BalanceChangeRowProps = {
  balanceChange: BalanceChange;
  transaction: UserTransactionResponse;
  columns: Column[];
};

function BalanceChangeRow({
  balanceChange,
  transaction,
  columns,
}: BalanceChangeRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = BalanceChangeCells[column];
        return (
          <Cell
            key={column}
            balanceChange={balanceChange}
            transaction={transaction}
          />
        );
      })}
    </GeneralTableRow>
  );
}

type BalanceChangeHeaderCellProps = {
  column: Column;
};

function BalanceChangeHeaderCell({column}: BalanceChangeHeaderCellProps) {
  switch (column) {
    case "address":
      return <GeneralTableHeaderCell header="Account" />;
    case "amountBefore":
      return (
        <GeneralTableHeaderCell header="Balance Before" textAlignRight={true} />
      );
    case "amountAfter":
      return (
        <GeneralTableHeaderCell header="Balance After" textAlignRight={true} />
      );
    case "gas":
      return <GeneralTableHeaderCell header="Gas" textAlignRight={true} />;
    case "amount":
      return <GeneralTableHeaderCell header="Change" textAlignRight={true} />;
    default:
      return assertNever(column);
  }
}

type CoinBalanceChangeTableProps = {
  balanceChanges: BalanceChange[];
  transaction: UserTransactionResponse;
  columns?: Column[];
};

export function CoinBalanceChangeTable({
  balanceChanges,
  transaction,
  columns = DEFAULT_COLUMNS,
}: CoinBalanceChangeTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <BalanceChangeHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <GeneralTableBody>
        {balanceChanges.map((balanceChange: any, i: number) => {
          return (
            <BalanceChangeRow
              key={i}
              balanceChange={balanceChange}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </GeneralTableBody>
    </Table>
  );
}
