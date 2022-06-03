import * as React from "react";
import {useTheme} from "@mui/material";
import * as RRD from "react-router-dom";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import {Types} from "aptos";
import {parseTimestamp, timestampDisplay} from "../pages/utils";
import {
  renderGas,
  renderSection,
  renderSuccess,
  renderTimestamp,
  renderTransactionType,
} from "../pages/Transactions/helpers";
import {assertNever} from "../utils";

type TransactionCellProps = {
  transaction: Types.OnChainTransaction;
};

function TransactionStatusCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {renderSuccess(transaction.success)}
    </TableCell>
  );
}

function TransactionTimestampCell({transaction}: TransactionCellProps) {
  const timestamp =
    "timestamp" in transaction ? (
      renderTimestamp(transaction.timestamp)
    ) : (
      // Genesis transaction
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  return <TableCell sx={{textAlign: "left"}}>{timestamp}</TableCell>;
}

function TransactionTypeCell({transaction}: TransactionCellProps) {
  return <TableCell>{renderTransactionType(transaction.type)}</TableCell>;
}

function TransactionVersionCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      <Link
        component={RRD.Link}
        to={`/txn/${transaction.version}`}
        color="primary"
      >
        {transaction.version}
      </Link>
    </TableCell>
  );
}

function TransactionGasCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      {renderGas(transaction.gas_used)}
    </TableCell>
  );
}

function TransactionHashCell({transaction}: TransactionCellProps) {
  return <TableCell>{transaction.hash}</TableCell>;
}

const TransactionCells = Object.freeze({
  status: TransactionStatusCell,
  timestamp: TransactionTimestampCell,
  type: TransactionTypeCell,
  version: TransactionVersionCell,
  gas: TransactionGasCell,
  hash: TransactionHashCell,
});

type TransactionColumn = keyof typeof TransactionCells;

const DEFAULT_COLUMNS: TransactionColumn[] = [
  "status",
  "timestamp",
  "type",
  "version",
  "gas",
];

type TransactionRowProps = {
  transaction: Types.OnChainTransaction;
  columns: TransactionColumn[];
};

function TransactionRow({transaction, columns}: TransactionRowProps) {
  return (
    <TableRow hover>
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        return <Cell key={column} transaction={transaction} />;
      })}
    </TableRow>
  );
}

type TransactionHeaderCellProps = {
  column: TransactionColumn;
};

function TransactionHeaderCell({column}: TransactionHeaderCellProps) {
  const theme = useTheme();
  const tableCellBackgroundColor = theme.palette.background.paper;

  switch (column) {
    case "status":
      return (
        <TableCell
          sx={{
            textAlign: "left",
            width: "2%",
            background: `${tableCellBackgroundColor}`,
            borderRadius: "8px 0 0 8px",
          }}
        ></TableCell>
      );
    case "timestamp":
      return (
        <TableCell
          sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
        >
          <Typography variant="subtitle1">Timestamp</Typography>
        </TableCell>
      );
    case "type":
      return (
        <TableCell
          sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
        >
          <Typography variant="subtitle1">Type</Typography>
        </TableCell>
      );
    case "version":
      return (
        <TableCell
          sx={{textAlign: "right", background: `${tableCellBackgroundColor}`}}
        >
          <Typography variant="subtitle1">Version ↓</Typography>
        </TableCell>
      );
    case "gas":
      return (
        <TableCell
          sx={{
            textAlign: "right",
            background: `${tableCellBackgroundColor}`,
            borderRadius: "0 8px 8px 0",
          }}
        >
          <Typography variant="subtitle1">Gas Used</Typography>
        </TableCell>
      );
    case "hash":
      return (
        <TableCell
          sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
        >
          <Typography variant="subtitle1">Hash</Typography>
        </TableCell>
      );
    default:
      return assertNever(column);
  }
}

type Props = {
  transactions: Types.OnChainTransaction[];
  columns?: TransactionColumn[];
};

export function TransactionsTable({
  transactions,
  columns = DEFAULT_COLUMNS,
}: Props) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TransactionHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction) => {
          return (
            <TransactionRow
              key={transaction.hash}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
