import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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

type BalanceChangeCellProps = {
  balanceChange: BalanceChange;
};

function AddressCell({balanceChange}: BalanceChangeCellProps) {
  return (
    <TableCell>
      <HashButton
        hash={balanceChange.address}
        type={HashType.ACCOUNT}
        size="large"
      />
    </TableCell>
  );
}

function AmountCell({balanceChange}: BalanceChangeCellProps) {
  const isNegative = balanceChange.change < 0;
  const amount = Math.abs(balanceChange.change);

  return (
    <TableCell
      sx={{
        textAlign: "right",
        color: isNegative ? negativeColor : primary[600],
      }}
    >
      {isNegative ? "-" : "+"}
      <APTCurrencyValue amount={amount.toString()} />
    </TableCell>
  );
}

const BalanceChangeCells = Object.freeze({
  address: AddressCell,
  amount: AmountCell,
});

type Column = keyof typeof BalanceChangeCells;

const DEFAULT_COLUMNS: Column[] = ["address", "amount"];

type BalanceChangeRowProps = {
  balanceChange: BalanceChange;
  columns: Column[];
};

function BalanceChangeRow({balanceChange, columns}: BalanceChangeRowProps) {
  return (
    <GeneralTableRow>
      {columns.map((column) => {
        const Cell = BalanceChangeCells[column];
        return <Cell key={column} balanceChange={balanceChange} />;
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
    case "amount":
      return <GeneralTableHeaderCell header="Amount" textAlignRight={true} />;
    default:
      return assertNever(column);
  }
}

type CoinBalanceChangeTableProps = {
  balanceChanges: BalanceChange[];
  columns?: Column[];
};

export function CoinBalanceChangeTable({
  balanceChanges,
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
      <TableBody>
        {balanceChanges.map((balanceChange: any, i: number) => {
          return (
            <BalanceChangeRow
              key={i}
              balanceChange={balanceChange}
              columns={columns}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
