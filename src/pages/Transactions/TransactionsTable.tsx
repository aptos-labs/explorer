import * as React from "react";
import {useTheme} from "@mui/material";
import * as RRD from "react-router-dom";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import GeneralTableRow from "../../components/GeneralTableRow";
import GeneralTableHeaderCell from "../../components/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../components/HashButton";

import {Types} from "aptos";
import {assertNever} from "../../utils";
import GasValue from "../../components/IndividualPageContent/ContentValue/GasValue";
import {TableTransactionType} from "../../components/TransactionType";
import {TableTransactionStatus} from "../../components/TransactionStatus";
import {getFormattedTimestamp} from "../utils";

type TransactionCellProps = {
  transaction: Types.Transaction;
};

function TransactionStatusCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      {"success" in transaction && (
        <TableTransactionStatus success={transaction.success} />
      )}
    </TableCell>
  );
}

function TransactionTimestampCell({transaction}: TransactionCellProps) {
  const timestamp =
    "timestamp" in transaction ? (
      getFormattedTimestamp(transaction.timestamp)
    ) : (
      // Genesis transaction
      <Typography variant="subtitle2" align="center">
        -
      </Typography>
    );

  return <TableCell sx={{textAlign: "right"}}>{timestamp}</TableCell>;
}

function TransactionTypeCell({transaction}: TransactionCellProps) {
  return (
    <TableCell>{<TableTransactionType type={transaction.type} />}</TableCell>
  );
}

function TransactionVersionCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "left"}}>
      <Link
        component={RRD.Link}
        to={`/txn/${"version" in transaction && transaction.version}`}
        color="primary"
        underline="none"
      >
        {"version" in transaction && transaction.version}
      </Link>
    </TableCell>
  );
}

function TransactionGasCell({transaction}: TransactionCellProps) {
  return (
    <TableCell sx={{textAlign: "right"}}>
      {"gas_used" in transaction && <GasValue gas={transaction.gas_used} />}
    </TableCell>
  );
}

function TransactionHashCell({transaction}: TransactionCellProps) {
  return (
    <TableCell>
      <HashButton hash={transaction.hash} type={HashType.TRANSACTION} />
    </TableCell>
  );
}

const TransactionCells = Object.freeze({
  version: TransactionVersionCell,
  type: TransactionTypeCell,
  hash: TransactionHashCell,
  status: TransactionStatusCell,
  gas: TransactionGasCell,
  timestamp: TransactionTimestampCell,
});

type TransactionColumn = keyof typeof TransactionCells;

const DEFAULT_COLUMNS: TransactionColumn[] = [
  "version",
  "type",
  "hash",
  "status",
  "gas",
  "timestamp",
];

type TransactionRowProps = {
  transaction: Types.Transaction;
  columns: TransactionColumn[];
};

function TransactionRow({transaction, columns}: TransactionRowProps) {
  const navigate = useNavigate();

  const rowClick = () => {
    navigate(`/txn/${"version" in transaction && transaction.version}`);
  };

  return (
    <GeneralTableRow onClick={rowClick}>
      {columns.map((column) => {
        const Cell = TransactionCells[column];
        return <Cell key={column} transaction={transaction} />;
      })}
    </GeneralTableRow>
  );
}

type TransactionHeaderCellProps = {
  column: TransactionColumn;
};

function TransactionHeaderCell({column}: TransactionHeaderCellProps) {
  const theme = useTheme();

  switch (column) {
    case "version":
      return <GeneralTableHeaderCell header="Version" />;
    case "type":
      return <GeneralTableHeaderCell header="Type" />;
    case "hash":
      return <GeneralTableHeaderCell header="Hash" />;
    case "status":
      return (
        <GeneralTableHeaderCell
          header="Status"
          sx={{
            borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
          }}
        />
      );
    case "gas":
      return (
        <GeneralTableHeaderCell
          header="Gas"
          textAlignRight={true}
          sx={{
            borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
          }}
        />
      );
    case "timestamp":
      return (
        <GeneralTableHeaderCell header="Timestamp" textAlignRight={true} />
      );
    default:
      return assertNever(column);
  }
}

type Props = {
  transactions: Types.Transaction[];
  columns?: TransactionColumn[];
};

export default function TransactionsTable({
  transactions,
  columns = DEFAULT_COLUMNS,
}: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TransactionHeaderCell key={column} column={column} />
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((transaction, i) => {
          return (
            <TransactionRow
              key={`${i}-${transaction.hash}`}
              transaction={transaction}
              columns={columns}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
