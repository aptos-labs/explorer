import * as React from "react";
import {Table, TableHead, TableRow} from "@mui/material";
import GeneralTableRow from "../../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../../components/Table/GeneralTableHeaderCell";
import {assertNever} from "../../../../utils";
import HashButton, {HashType} from "../../../../components/HashButton";
import {BalanceChange} from "../../utils";
import CurrencyValue, {
  APTCurrencyValue,
} from "../../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {
  negativeColor,
  primary,
} from "../../../../themes/colors/aptosColorPalette";
import {Types} from "aptos";
import GeneralTableBody from "../../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../../components/Table/GeneralTableCell";

function getIsSender(
  address: string,
  transaction: Types.UserTransaction,
): boolean {
  return transaction.sender === address;
}

function getGas(transaction: Types.UserTransaction): bigint {
  return BigInt(transaction.gas_unit_price) * BigInt(transaction.gas_used);
}

type BalanceChangeCellProps = {
  balanceChange: BalanceChange;
  transaction: Types.UserTransaction;
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
      <CurrencyValue
        amount={amountBefore.toString()}
        decimals={balanceChange.asset.decimals}
        currencyCode={balanceChange.asset.symbol}
      />
    </GeneralTableCell>
  );
}

function AmountAfterCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <GeneralTableCell sx={{textAlign: "right"}}>
      <CurrencyValue
        amount={balanceChange.amountAfter}
        decimals={balanceChange.asset.decimals}
        currencyCode={balanceChange.asset.symbol}
      />
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
      <CurrencyValue
        amount={amount.toString()}
        currencyCode={balanceChange.asset.symbol}
        decimals={balanceChange.asset.decimals}
      />
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
  transaction: Types.UserTransaction;
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
  transaction: Types.UserTransaction;
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
