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

import {Transaction} from "../api_client";
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
  transaction: Transaction;
};

function TransactionStatusCell({transaction}: TransactionCellProps) {
  const icon =
    "success" in transaction ? renderSuccess(transaction.success) : null;

  return <TableCell sx={{textAlign: "left"}}>{icon}</TableCell>;
}

function TransactionTimestampCell({transaction}: TransactionCellProps) {
  const timestamp =
    "timestamp" in transaction ? (
      renderTimestamp(transaction.timestamp)
    ) : (
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
  if (!("version" in transaction)) {
    return null;
  }

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
  if (!("gasUsed" in transaction)) {
    return null;
  }

  return (
    <TableCell sx={{textAlign: "right"}}>
      {renderGas(transaction.gasUsed)}
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
  transaction: Transaction;
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

  if (column === "status") {
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
  } else if (column === "timestamp") {
    return (
      <TableCell
        sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
      >
        <Typography variant="subtitle1">Timestamp ↓</Typography>
      </TableCell>
    );
  } else if (column === "type") {
    return (
      <TableCell
        sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
      >
        <Typography variant="subtitle1">Type ↓</Typography>
      </TableCell>
    );
  } else if (column === "version") {
    return (
      <TableCell
        sx={{textAlign: "right", background: `${tableCellBackgroundColor}`}}
      >
        <Typography variant="subtitle1">Version ↓</Typography>
      </TableCell>
    );
  } else if (column === "gas") {
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
  } else if (column === "hash") {
    return (
      <TableCell
        sx={{textAlign: "left", background: `${tableCellBackgroundColor}`}}
      >
        <Typography variant="subtitle1">Hash</Typography>
      </TableCell>
    );
  } else {
    return assertNever(column);
  }
}

type Props = {
  transactions: Transaction[];
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
